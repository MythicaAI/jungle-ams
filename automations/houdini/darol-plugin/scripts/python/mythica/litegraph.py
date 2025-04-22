import hou
import re
import ast
import uuid
import os
import json
import zipfile

import mythica.network as mnet
import mythica.parm_transpiler as pjt


def get_network(start_here, 
                traverse_subnet=True, 
                traverse_hda=False ):
    
    nets= {"networks": mnet.get_network(start_here, traverse_subnet, traverse_hda)}
    nets = _export_litegraph(nets)

    return json.dumps(
        nets,
        default=mnet.houdini_serializer,
        indent=2
    )


def create_network(network_data, parent_node):
    """
    The inverse operation of `get_network()`, this method generates a Houdini Node Network 
    represented by `network_data` (a json string) and appends it to the existing session at 
    the specified `parent_node`

    Only Mythica.json format (the default output from get_network) is supported as input 
    which will obviously need to change
    """
    #detect litegraph format
    if network_data.get("nodes"):
        network_data = _import_litegraph(network_data)

    return mnet.create_network(network_data, parent_node)

def get_litegraph_classes(output_path,
                          icon_path, 
                          icon_path_rel):
    """
    Returns a JSON structure that contains nodeType definition for every
    node type present in the resident Houdini installation. 

    If icon_path is specified, icons associated with the node_types are
    saved to the location.

    icon_path_rel specifies a webfriendly URL path for icons.
    """
    node_types = mnet.get_node_types()
    for nt in node_types:
        get_litegraph_class(nt,output_path, icon_path, icon_path_rel)


def get_litegraph_class(node_type,  
                        output_path,                 
                        icon_path, 
                        icon_path_rel):


    # Handle Icons
    icon_type = node_type['icon'].split('?')[-1]
    binary = False  
    if icon_type == 'IconImage':
        content = hou.readBinaryFile(node_type['icon'])
        binary = True
    elif icon_type == 'IconSVG':
        content = hou.readFile(node_type['icon'])
    else:
        content = _get_houdini_icon(node_type['icon'])
        
    if content is None:
        print(f"Failed to read the file: {node_type['icon']}")
        node_type['icon'] = None
    else:
        # Save the content to the new location
        try:
            if binary:
                icon = node_type['class']+".png"
                with open(os.path.join(icon_path, icon), "wb") as file:
                                    file.write(content)  # Write binary content
                node_type['icon'] = os.path.join(icon_path_rel if icon_path_rel else icon_path,icon)
            else:
                icon = node_type['class']+".svg"
                with open(os.path.join(icon_path,icon), "w") as file:
                    file.write(content)
                node_type['icon'] = os.path.join(icon_path_rel if icon_path_rel else icon_path,icon)

        except IOError as e:
            print(f"Error writing file {os.path.join(icon_path,icon)}: {e}")
            node_type['icon'] = None

    node_class, class_name = _getLitegraphNodeType(node_type)
    out_file = os.path.join(output_path,f"{class_name}.js")
    with open(out_file, 'w') as file:
        file.write(node_class)

def _getLitegraphNodeType(nt):

    options = {
        'is_root': nt['root'], 
        'class' : nt['class'],
        'litegraph': nt['litegraph'],
        'category' : f'/{nt["category"].upper()}{nt["namespace"] and "/" + nt["namespace"]}',
        'type': nt['type'],
        'title' : nt['description'],
        'icon': nt['icon'],
        'inputs': [],
        'outputs': [],
        'extends': 'hou._HoudiniBase',
        'mixins': [],
        'code': pjt.transpiler(nt['code']).replace('\n','\n\t\t\t'),
    }

    if nt["subnet"]:
        options['mixins'].append('hou._SubgraphMixin')
    
    #Process Inputs
    if nt['inputs'] > 99:
        options['mixins'].append('hou._MultiInputMixin')
        options['inputs'].append(f"{nt['category'].upper()}")
    else:
        for i in range(nt['inputs']):
            options['inputs'].append(f"{nt['category'].upper()}")

    #Process Outputs
    for i in range(nt['outputs']):
        options['outputs'].append(f"{nt['category'].upper()}")
    

    def toJsBool(val):
        return 'true' if val else 'false'

    superclass = options['extends']
    if len(options['mixins']) > 0:
        superclass = f'hou.extend({options["extends"]}).with({", ".join(options["mixins"])})'
        

    class_def = f"""
export default function (hou) {{
    class {options['class']} extends {superclass} {{
        static is_root = {toJsBool(options['is_root'])};
        static id = '{options['litegraph']}';
        static category = '{options['category']}';
        static houdiniType = '{options['type']}';
        static title = '{options['title']}';
        static icon = '{options['icon']}';
        constructor() {{
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = {[''+input for input in options['inputs']]};
            const outputs = {[''+output for output in options['outputs']]};

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }}
        parmTemplatesInit() {{
            {options['code']}
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }}
    }}
    hou.registerType('{options['litegraph']}',{options['class']})
    return {options['class']}
}}
        """
    return class_def, options['class']


def _import_litegraph(litegraph):
    node_dict = {}  # Dictionary to map node IDs to their network entries

    def node_to_network(node):
        network = {
            'id': node['id'],
            'type': node['flags']['houdini_type'],
            'pos': [float(value) / -100 for value in node['pos']],
            'inputs': 'inputs' in node and [{'name': str(inp['name']), 'type': inp['type'], 'link': None} for inp in node['inputs']],
            'outputs': 'outputs' in node and [{'name': out['name'], 'type': out['type'], 'links': []} for out in node['outputs']],
            'parameters': {},
            'networks': [],
            'connections': []
        }

        # Handle properties, especially ramp parameters
        for key, value in node['properties'].items():
            if isinstance(value, list) and value and isinstance(value[0], dict) and 'x' in value[0] and 'y' in value[0]:
                # It's a ramp parameter
                network['parameters'][key] = {
                    'basis': [v['basis'] for v in value],
                    'keys': [v['x'] for v in value],
                    'values': [v['y'] for v in value]
                }
            elif key == "Node name for S&R":
                # handle special cases or skip
                pass
            else:
                # Other types of properties
                network['parameters'][key] = value

        # Handle subgraphs if they exist
        if 'subgraph' in node and len(node['subgraph']['nodes']) > 0:
            # Save the network in the node dictionary using its ID
            networks = {}

            for sub_node in node['subgraph']['nodes']:
                sub_network = node_to_network(sub_node)
                networks[sub_node['id']] = sub_network
            network['networks'] = networks.values()
            reconstruct_connections(node['subgraph']['links'], networks)

        # Reconstruct connections using the global node dictionary

        return network

    def reconstruct_connections(links, networks):
        for link in links:
            if link[3] in networks:  # Check if the 'to' node ID is in the dictionary
                network = networks[link[3]]
                connection = {
                    'from': link[1],
                    'from_idx': link[2],
                    'to': link[3],
                    'to_idx': link[4]
                }
                network['connections'].append(connection)

    # Start converting
    networks = {}
    
    for node in litegraph['nodes']:
        network = node_to_network(node)
        networks[node['id']] = network
    reconstruct_connections(litegraph['links'], networks)
    return {'networks': networks.values()}


def _export_litegraph(networks):
    def network_to_node(network, litegraph):
        properties = {}
        for i in network["parameters"]:
            parm = network["parameters"][i]
            properties[i] = parm
            
            if isinstance(parm,dict):
                properties[i] = []
                for index in range(len(parm["keys"])):
                    properties[i].append({
                        'x': parm["keys"][index],
                        'y': parm["values"][index],
                        'basis': parm["basis"][index]
                    })

        #Basic Node Template
        node = {
            'id': network['id'],
            'title': network['id'],
            'type': network['litegraph'],
            'class': network['class'],
            'pos': [value * -100 for value in network['pos']],  # Scale positions as needed
            'inputs':network['inputs'],
            'outputs':network['outputs'],
            'properties': properties,
        }
        
        litegraph['nodes'].append(node)

        # Recursively add sub-networks
        if 'networks' in network and network['networks']:
            node['subgraph'] = new_node()

            for sub_network in network['networks']:
                network_to_node(sub_network, node['subgraph'])  # Recursive call
                _adjust_links(node['subgraph'])

        # Add connections
        if 'connections' in network:
            conn_count=0
            for conn in network['connections']:
                conn_count += 1
                litegraph['links'].append([
                    f"{uuid.uuid4()}",
                    conn['from'],
                    conn['from_idx'],
                    conn['to'],
                    conn['to_idx'],
                    f"{network['category'].upper()}"
                ])

    def _adjust_links(litegraph):
        """
        Correctly set linkID on Litegraph nodes
         
        Litegraph connections are doubly referenced. The nodes need to know about
        links, The links already know about nodes from above so we just need to 
        #go back and do the double link
        """ 
        outputLinksByNodeId = {}
        inputLinksByNodeId = {}
        
        for link in litegraph['links']:
            linkid=link[0]
            origin_nodeid=link[1]
            origin_slot=link[2]
            target_nodeid=link[3]
            target_slot=link[4]

            # For each node, we catalog the ids of its input and output links.
            outputLinksByNodeId.setdefault(origin_nodeid, {})
            inputLinksByNodeId.setdefault(target_nodeid,{})
            outputLinksByNodeId[origin_nodeid].setdefault(origin_slot,[])
            inputLinksByNodeId[target_nodeid].setdefault(target_slot,None)

            inputLinksByNodeId[target_nodeid][target_slot] = linkid
            if not linkid in outputLinksByNodeId[origin_nodeid][origin_slot]:
                outputLinksByNodeId[origin_nodeid][origin_slot].append(linkid)
        
        #
        for node in litegraph['nodes']:
            nodeid = node['id']
            if nodeid in inputLinksByNodeId: 
                inputs = inputLinksByNodeId[nodeid]
                for input in node['inputs']:
                    if input['name'] in inputs.keys():
                        linkid = mnet.normalizeList(inputs[input['name']])
                        input['link'] = linkid
            if nodeid in outputLinksByNodeId: 
                outputs = outputLinksByNodeId[nodeid]
                for output in node['outputs']:
                    if output['name'] in outputs.keys():
                        linkid = outputs[output['name']]
                        output['links'] = linkid

    def new_node():
        return {
                'nodes': [],
                'links': []
            }

    litegraph_ret = new_node()

    # Assuming the root of JSON is always an array of networks
    for network in networks['networks']:
        network_to_node(network, litegraph_ret)
        _adjust_links(litegraph_ret)

    return litegraph_ret



_icon_mapping = {}

def _get_houdini_icon(icon_path):
    icon_zip_path = hou.text.expandString("${HFS}/houdini/config/Icons/icons.zip")
    global _icon_mapping

    try:
        with zipfile.ZipFile(icon_zip_path) as zip_file:
            contents = zip_file.namelist()
            node_type_folder, svg_name = icon_path.split("_", 1)
            icon_file_path = os.path.join(node_type_folder, svg_name + '.svg')

            if icon_file_path not in contents:
                if not _icon_mapping:
                    _load_icon_mappings(zip_file)
                mapped_name = _icon_mapping.get(icon_path)
                if mapped_name:
                    node_type_folder, new_name = mapped_name.split("_", 1)
                    icon_file_path = os.path.join(node_type_folder, new_name + '.svg')
                else:
                    # Some icons are missing from the SideFX provided icon mapping :(
                    # (e.g. measure 2.0 node indicates SOP_measure-2.0, but that doesn't exist.
                    # Attempt to strip node version number and check directly for base version.
                    if "-" in icon_file_path:
                        base_icon_name = icon_file_path.split("-")[0]
                        potential_paths = [name for name in contents if name.startswith(base_icon_name)]
                        if base_icon_name in potential_paths:
                            icon_file_path = base_icon_name + ".svg"
                        elif potential_paths:
                            icon_file_path = potential_paths[0]

            if icon_file_path in contents:
                with zip_file.open(icon_file_path) as icon:
                    icon_content = icon.read()
                    svg_xml = "{0}".format(icon_content.decode('utf-8'))
                    return svg_xml
    except:
        return None




def _load_icon_mappings(zip_file):
    global _icon_mapping
    with zip_file.open("IconMapping") as mapping:
        for line in mapping:
            decoded_line = line.decode('utf-8').rstrip('\n')
            if not decoded_line:
                continue
            mapping_line = [
                x.strip(" \t\n\r;") for x in decoded_line.split(":=")
                if not x.startswith("#")
            ]
            if len(mapping_line) == 2:
                from_name, to_name = mapping_line
                _icon_mapping[from_name] = to_name
