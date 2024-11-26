import hou
import re
import ast
import uuid
import os
import json
import zipfile

import mythica.network as mnet


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
        'code': _transpiler(nt['code']).replace('\n','\n\t\t\t'),
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

import ast
import re

def _transpiler(code):
    class Transpiler(ast.NodeVisitor):
        def __init__(self):
            self.transpiled_code = []
            self.declared_variables = set()

        def visit_Assign(self, node):
            # Handles variable assignments, e.g., varname = Something()
            if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
                var_name = node.targets[0].id
                value = node.value
                declaration_prefix = 'let ' if var_name not in self.declared_variables else ''
                self.declared_variables.add(var_name)
                if isinstance(value, ast.Call) and isinstance(value.func, ast.Attribute) and value.func.attr == 'ParmTemplateGroup':
                    self.transpiled_code.append(f'{declaration_prefix}{var_name} = new hou.{value.func.attr}();\n')
                    self.transpiled_code.append(f'this.parmTemplateGroup = {var_name};\n')
                elif isinstance(value, ast.Call) and isinstance(value.func, ast.Attribute) and value.func.attr.endswith('ParmTemplate'):
                    self.handle_constructor(var_name, value, declaration_prefix)
                else:
                    self.transpiled_code.append(f'{declaration_prefix}{var_name} = {self.generic_visit(value)};\n')
            self.generic_visit(node)

        def visit_Expr(self, node):
            # This will handle standalone method calls
            if isinstance(node.value, ast.Call):
                call_node = node.value
                if isinstance(call_node.func, ast.Attribute):
                    func_name = call_node.func.attr
                    call_args = ', '.join(self.handle_value(arg) for arg in call_node.args)
                    call_line = f'{call_node.func.value.id}.{func_name}({call_args});\n'
                    self.transpiled_code.append(call_line)
            self.generic_visit(node)

        def handle_constructor(self, var_name, call_node, declaration_prefix):
            class_name = call_node.func.attr
            # Maps class names to their ordinal constructor parameters
            constructor_params = {
                'ButtonParmTemplate': ['name', 'label'],
                'DataParmTemplate': ['name', 'label', 'num_components'],
                'FloatParmTemplate': ['name', 'label', 'num_components'],
                'FolderParmTemplate': ['name', 'label', 'parm_templates'],
                'FolderSetParmTemplate': ['name', 'folder_names'],
                'IntParmTemplate': ['name', 'label', 'num_components'],
                'LabelParmTemplate': ['name', 'label', 'column_labels'],
                'MenuParmTemplate': ['name', 'label', 'menu_items'],
                'RampParmTemplate': ['name', 'label', 'ramp_parm_type'],
                'SeparatorParmTemplate': ['name'],
                'StringParmTemplate': ['name', 'label', 'num_components'],
                'ToggleParmTemplate': ['name', 'label']
            }

            # Initialize argument handling
            args_list = []
            kwargs_dict = {}

            # Process ordinal (positional) arguments
            params_list = constructor_params.get(class_name, [])
            for i, arg in enumerate(call_node.args):
                if i < len(params_list):  # Ensure we do not process more args than defined
                    param_name = params_list[i]
                    args_list.append(f'{param_name}: {self.handle_value(arg)}')
                else:
                    # Handle extra positional args not in the ordinal list as normal args
                    args_list.append(self.handle_value(arg))

            # Process keyword (named) arguments
            for kw in call_node.keywords:
                kwargs_dict[kw.arg] = self.handle_value(kw.value)

            # Combine all arguments into a single string
            args_str = ', '.join(args_list + [f'{k}: {v}' for k, v in kwargs_dict.items()])
            self.transpiled_code.append(f'{declaration_prefix}{var_name} = new hou.{class_name}({{{args_str}}});\n')

        def handle_value(self, node):
            if isinstance(node, ast.Constant):
                if node.value is None:
                    return 'null'  # Handle None values correctly
                elif isinstance(node.value, bool):
                    return str(node.value).lower()  # Ensure Boolean values are lowercase
                elif isinstance(node.value, str):
                    # Use repr to handle the string and manually adjust quotes
                    # This preserves the original escape characters and adds additional escaping where necessary
                    escaped_string = repr(node.value)
                    # Ensure the string is enclosed in double quotes
                    if escaped_string.startswith("'") and escaped_string.endswith("'"):
                        escaped_string = '"' + escaped_string[1:-1].replace('"', '\\"') + '"'
                    return escaped_string
                else:
                    return str(node.value)  # Directly return the string representation for other types
            elif isinstance(node, ast.Name):
                return node.id
            elif isinstance(node, ast.Call):
                func_name = self.handle_value(node.func)
                args = ', '.join(self.handle_value(arg) for arg in node.args)
                return f'{func_name}({args})'
            elif isinstance(node, ast.Attribute):
                value = self.handle_value(node.value)
                attr = node.attr
                return f'{value}.{attr}'
            elif isinstance(node, ast.List) or isinstance(node, ast.Tuple):
                elements = ', '.join(self.handle_value(el) for el in node.elts)
                return f'[{elements}]'
            elif isinstance(node, ast.Dict):
                keys = [self.handle_value(k) for k in node.keys]
                values = [self.handle_value(v) for v in node.values]
                dict_elements = ', '.join(f'{k}: {v}' for k, v in zip(keys, values))
                return f'{{{dict_elements}}}'
            else:
                return 'null'

    def preprocess(code):
        """Handle specific quirks in the nodetypes of Houdini. Should Probably report as bugs :) """
        code = re.sub(r"(setTags\(\{\"Select geometry from an available viewport.)\n",r'\1',code)
        code = re.sub(r"\"(Disable \"Restrict playback range\")\"",r"'\1'", code)
        pattern_items = r'(item_generator_script)="(.*?)", \1'
        pattern_defaults = r"(default_expression)='(.*?)', \1"

        def replace_with_double_quotes(match):
            # Extract the content inside the single quotes, correctly handling escaped single quotes
            match_type = match.group(1)
            inner_content = match.group(2)
            # Unescape single quotes for correct double quote escaping
            inner_content = inner_content.replace("\\'", "'")
            # Escape internal double quotes that are not already escaped
            inner_content = re.sub(r'(?<!\\)"', r'\\"', inner_content)
            inner_content = re.sub(r'\n', r'\\\n', inner_content)
                        
            # Replace with double quotes and escape the internal content
            return f'{match_type}="{inner_content}", {match_type}'

        # Apply the regex substitution
        code = re.sub(pattern_items, replace_with_double_quotes, code, flags=re.DOTALL)
        code = re.sub(pattern_defaults, replace_with_double_quotes, code, flags=re.DOTALL)
        code = code.replace('""""','""')
        
        return code

    tree = ast.parse(preprocess(code))
    transpiler = Transpiler()
    transpiler.visit(tree)
    return ''.join(transpiler.transpiled_code)


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
