from pydantic import BaseModel
import hou
import json
import re
import enum
import os

MULTI_INPUT_MIN = 10
MULTI_OUTPUT_MIN = 10

excludes = [
    'mythica::network_export::1.0',
    'mythica::node_inspector::1.0',
]

def is_excluded(node):
    return node.type().name() in excludes

class RampBasis(enum.Enum):
    Linear = hou.rampBasis.Linear
    Constant = hou.rampBasis.Constant
    CatmullRom = hou.rampBasis.CatmullRom
    MonotoneCubic = hou.rampBasis.MonotoneCubic
    Bezier = hou.rampBasis.Bezier
    BSpline = hou.rampBasis.BSpline
    Hermite = hou.rampBasis.Hermite

class HDAOptions(BaseModel):
    check_for_external_links: bool
    forbid_outside_parms: bool
    lock_contents: bool
    unlock_new_instances: bool
    compress_contents: bool
    make_initial_parms_defaults: bool

class HouNodeType(BaseModel):
    parm_template_group: str
    min_num_inputs: int
    max_num_inputs: int
    default_color: tuple[float,float,float]
    default_shape: str

class HDADefinition(BaseModel):
    file_name: str
    node_type: str
    name: str
    version: str
    comment: str
    description: str
    icon: str
    embedded_help: str
    user_info: str
    extra_info: str
    extra_file_options: dict[str,str|bool|float|int]
    sections: dict[str,str]
    options: HDAOptions
    node_type: HouNodeType
    
def get_hda_definition(hda_definition: hou.HDADefinition):
    try: 
        sections = hda_definition.parsedContents()
    except:
        sections = hda_definition.uncompressedContents()
    finally:
        sections = {}

    hda = HDADefinition(
        file_name= os.path.basename(hda_definition.libraryFilePath()),
        name= hda_definition.nodeTypeName(),
        version= hda_definition.version(),
        comment= hda_definition.comment(),
        description= hda_definition.description(),
        icon= hda_definition.icon(),
        embedded_help= hda_definition.embeddedHelp(),
        user_info= hda_definition.userInfo(),
        extra_info= hda_definition.extraInfo(),
        extra_file_options= hda_definition.extraFileOptions(),
        sections= sections,
        options= HDAOptions(
            check_for_external_links= hda_definition.options().checkForExternalLinks(),
            forbid_outside_parms= hda_definition.options().forbidOutsideParms(),
            lock_contents= hda_definition.options().lockContents(),
            unlock_new_instances= hda_definition.options().unlockNewInstances(),
            compress_contents= hda_definition.options().compressContents(),
            make_initial_parms_defaults= hda_definition.options().makeInitialParmsDefaults(),
        ),
        node_type= HouNodeType(
            parm_template_group= hda_definition.nodeType().parmTemplateGroup().asCode(),
            min_num_inputs= hda_definition.nodeType().minNumInputs(),
            max_num_inputs= hda_definition.nodeType().maxNumInputs(),
            default_color= hda_definition.nodeType().defaultColor().rgb(),
            default_shape= hda_definition.nodeType().defaultShape(),
        )
    )

    return hda.model_dump()

def create_hda(node, hda_definition: HDADefinition, hda_file_path):
    node.createDigitalAsset(
        name=hda_definition.name,
        hda_file_name=hda_file_path,
        description=hda_definition.description,
        min_num_inputs=hda_definition.node_type.min_num_inputs,
        max_num_inputs=hda_definition.node_type.max_num_inputs,
        compress_contents=hda_definition.options.compress_contents,
        comment=hda_definition.comment,
        version=hda_definition.version,
        create_backup=False
    )

def get_node_types():
    node_types = []
    # Iterate over all node categories and node types within those categories
    for category in hou.nodeTypeCategories().values():
        for node_type in category.nodeTypes().values():
            node_types.append(get_node_type(node_type))

    return node_types

def get_node_type(node_type, include_code = True):
    # Get standard names for category, namespace, name, version, type, classes
    node_type_strs = _get_node_type_strings(node_type)

    num_inputs = node_type.maxNumInputs()
    nt = {
        "root": node_type.isManager(),
        "subnet": node_type.childTypeCategory().name() if node_type.childTypeCategory() else '',
        "help": node_type.embeddedHelp(),
        "icon": node_type.icon(),
        "inputs": num_inputs,  # Gather inputs
        "outputs": node_type.maxNumOutputs(),  # Gather outputs
        "defaults": {},  # parameters
    }
    if include_code:
        nt["code"] = node_type.parmTemplateGroup().asCode()
    nt.update(node_type_strs)

    # Get input labels
    if num_inputs <= MULTI_INPUT_MIN:
        input_labels = [''] * num_inputs

        sections = node_type.definition().sections() if node_type.definition() else []
        if "DialogScript" in sections:
            dialog_script = sections["DialogScript"].contents()
            matches = re.findall(r'inputlabel\s+(\d+)\s+"([^"]+)"', dialog_script)
            for match in matches:
                index = int(match[0]) - 1
                if index < num_inputs:
                    input_labels[index] = match[1]

        nt["inputLabels"] = input_labels

    # Loop through all the parameters of the node for defaults and to
    # sort out ramp parms. 
    for parmtemp in node_type.parmTemplates():
        if _isValueParm(parmtemp) and not parmtemp.isHidden():
            defaults = _get_parm_defaults(parmtemp)
            if defaults is not None:
                nt["defaults"][parmtemp.name()] = defaults

    return nt

def get_network(start_here, 
                traverse_subnet=True, 
                traverse_hda=False):
    """
    Returns the Houdini Node Network starting at the specified `start_here <hou.Node>`. 
    """
    if not (isinstance(start_here, tuple) or isinstance(start_here,list)):
        start_here = [start_here]
    
    networks=[]
    for node in start_here:
        networks.append(_traverse_node(node, traverse_subnet, traverse_hda))

    # Serialize to JSON
    
    nets= {"networks": networks}

    return json.dumps(
        nets,
        default=houdini_serializer,
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

    nodes = network_data.get("networks", [])
    for node_data in nodes:
        try:
            if parent_node is None:
                if node_data["id"]!='/':
                    raise Exception(f"Cannot import complete object networks into a root Target path - {node_data['id']}")
                node = hou.node('/')

            elif parent_node.path() == '/':
                node = parent_node.node(node_data["id"])
            else:
                try:
                    node = parent_node.createNode(node_data["type"], node_name=node_data["id"])
                except:
                    node = parent_node.createNode("subnet", node_name=node_data["id"])
                _set_nodeinfo(node, node_data)
            # Recursive call for subnetworks
            if "networks" in node_data and not node.isLockedHDA():
                create_network(node_data, node)
        except Exception as e:
            print(f"Error creating network: {e} {node_data['id']}")

    # Create connections
    _create_connections(nodes, parent_node)
    if parent_node and parent_node.isNetwork():
        parent_node.layoutChildren()

"""
depth-first (if `traverse_subnet`)  traversal of the `_node` and its children.
getting information about the node (optionally will `include_geometry` when specified)
and connections on each pass. 
"""
def _traverse_node(_node, traverse_subnet, traverse_hdas):

    node_info = _get_nodeinfo(_node)
    node_info["networks"] = []
    
    #Skip locked nodes and this self.
    if traverse_subnet and (_node.isLockedHDA() == False or traverse_hdas):
        for child in _node.children():
            if not is_excluded(child):
                node_info["networks"].append(_traverse_node(child,traverse_subnet, traverse_hdas))
    
    node_info["connections"] = _get_connections(_node, node_info)
        
    return node_info

"""
Get information about a Houdini node. using the template defined 
This is a raw internal representation of a node as a python DICT.

The get_network() method transforms this output into relevant JSON
formats for output
"""
def _get_nodeinfo(_node):
    # category, namespace, name, version, type
    node_type_str = _get_node_type_strings(_node.type())

    node_info =  {
        "id": _node.name(),
        "pos": [-1*_node.position()[0],_node.position()[1]],
        "parameters": {},
        "geometry": None,
        "inputs": [],
        "outputs": [],
    }
    node_info.update(node_type_str)

    #Keep track of exploded versions ramp_part_templates templates
    rp_part_templates = []
    def _is_rp_part(parmname):
        parmname = re.sub(r'\d+','#',parmname)
        return parmname in rp_part_templates

    # 1. Enumerate Parms.
    #
    # Loop through all the parameters of the node for defaults and to
    # sort out ramp parms. Ramp parms are listed both as rampParm types but
    # then also as their primitive parts (a tuple of (basis,key,value) for each
    # point on the ramp. The rampParm types appear first so we collect the template
    # string for for those in rp_parm_tempaltes (global scope). The is_rp_part() method
    # then check if subsequent parms are actually just instances of a rampParm that
    # has already been processed. 
    for parmTup in _node.parmTuples():
        
        if not _is_rp_part(parmTup.name()):
            parmtemp = parmTup.parmTemplate()
            if isinstance(parmtemp, hou.RampParmTemplate):
                #dehydrate them parm and store the part templates for it
                for parmtt in parmtemp.parmTemplates():
                    rp_part_templates.append(parmtt.name())

    # Now find parms that changed from defaults
    for parmTup in _node.parmTuples():
        parmTemp =  parmTup.parmTemplate()
        modified = not parmTup.isTimeDependent() and (
            (isinstance(parmtemp, hou.RampParmTemplate)) or 
            (not isinstance(parmtemp, hou.RampParmTemplate) and not parmTup.isAtDefault(True, True))
        )

        # Again takes advantage of the parmRamp parms we keep track of to exclude the
        # exploded primitive version of rampParms. 
        if not _is_rp_part(parmTup.name()) and modified:
            parmtemp = parmTup.parmTemplate()
            if _isValueParm(parmtemp):
                value = None
                if isinstance(parmtemp, hou.RampParmTemplate):
                    temp = normalizeList(parmTup.evalAsRamps())
                    # rehydrate the rampParms
                    value = {
                        "basis": [basis.name() for basis in temp.basis()],
                        "keys": temp.keys(),
                        "values": temp.values()
                    }
                else:
                    # Non ramp parms are easy
                    value = normalizeList(parmTup.eval())
            
                node_info["parameters"][parmTup.name()] = value

    # 2. Enumerate Inputs
    #
    if _node.type().maxNumInputs() > MULTI_INPUT_MIN:
        node_info["inputs"].append({
                "name": 0,
                "type": f"{_get_node_type_strings(_node.type())['category'].upper()}",
                "link": None
            })
    else:
        for index,input in enumerate(_node.inputConnectors()):
            node_info["inputs"].append({
                "name": index,
                "type": f"{_get_node_type_strings(_node.type())['category'].upper()}",
                "link": None
            })

    # 3. Enumerate Outputs
    #
    if _node.type().maxNumOutputs() > MULTI_OUTPUT_MIN:
        node_info["outputs"].append({
                "name": 0,
                "type": f"{_get_node_type_strings(_node.type())['category'].upper()}",
                "link": None
            })
    else:
        for index,output in enumerate(_node.outputConnectors()):
            node_info["outputs"].append({
                "name": index,
                "type": f"{_get_node_type_strings(_node.type())['category'].upper()}",
                "links": []
            })

    return node_info

"""
Rehydrates a node with data from a Mythica Json network fragmnet.
"""
def _set_nodeinfo(node, node_data):
    parmdefs = node_data.get("parameters", {})
    for k,v in parmdefs.items():
        if isinstance(v, dict):
            basis = [RampBasis[b].value for b in v["basis"]]
            keys = v["keys"]
            values = v["values"]
            
            ramp = hou.Ramp(basis,keys,values)
            
            node.parm(k).set(ramp)
        else:
            #Make sure value is a sequence
            val = [v] if not (isinstance(v, tuple) or isinstance(v, list)) else v
            node.parmTuple(k).set(val)

def _get_connections(_node, node_data):
    """
    Get connections for a node using inputConnections().
    """
    connections = []
    idx = 0
    multi = _node.type().maxNumInputs() > MULTI_INPUT_MIN
    for conn in _node.inputConnections():
        try:
            input_node = conn.inputNode()
            if (input_node and multi and idx>0):
                node_data["inputs"].append({
                    "name": idx,
                    "type": f"{_get_node_type_strings(_node.type())['category'].upper()}",
                    "link": None
                })

            input_index = conn.inputIndex() if not multi else idx
            output_index = conn.outputIndex()
            connections.append({
                "from": input_node.name(),
                "from_idx": output_index, #THESE ARE REVERSED ON PURPOSE - SEE DOCS https://www.sidefx.com/docs/houdini/hom/hou/NodeConnection.html
                "to": _node.name(),
                "to_idx": input_index
            })
            idx += 1
        except:
            pass
    return connections    

def _create_connections(nodes, parent_node):
    for node in nodes:
        for conn in node.get("connections", []):
            from_idx = conn["from_idx"]
            from_node = parent_node.node(conn["from"])
            to_node = parent_node.node(conn["to"])
            to_idx = conn["to_idx"] 
            to_node.setInput(to_idx, from_node, from_idx)

def houdini_serializer(obj):
    # Helper function to reshape a flat list into sublists of size `num_columns`
    def reshape(values, num_columns):
        return [values[i:i + num_columns] for i in range(0, len(values), num_columns)]

    if isinstance(obj, hou.Geometry):
        #Parse geometry into its "spreadsheets"
        data = {'points':{},'prims':{},'detail':{}}
        # Points
        for attrib in obj.pointAttribs():
            attribName = attrib.name()
            values = []
            if attrib.dataType() == hou.attribData.String:
                values = list(obj.pointStringAttribValues(attribName))
            elif attrib.dataType() == hou.attribData.Float:
                values = list(obj.pointFloatAttribValues(attribName))
            elif attrib.dataType() == hou.attribData.Int:
                values = list(obj.pointIntAttribValues(attribName))
            
            if len(values) > 0: 
                if attrib.size() > 1:
                    values = reshape(values,attrib.size())
                data['points'][attrib.name()] = values

        # Prims
        for attrib in obj.primAttribs():
            attribName = attrib.name()
            values = None
            if attrib.dataType() == hou.attribData.String:
                values = list(obj.primStringAttribValues(attribName))
            elif attrib.dataType() == hou.attribData.Float:
                values = list(obj.primFloatAttribValues(attribName))
            elif attrib.dataType() == hou.attribData.Int:
                values = list(obj.primIntAttribValues(attribName))
            
            if len(values) > 0:
                if attrib.size() > 1:
                    values = reshape(values,attrib.size())
                data['prims'][attrib.name()] = values
            
        # Details
        detail_attrib_names = [attrib.name() for attrib in obj.globalAttribs()]
        data["details"] = [{name: obj.attribValue(name) for name in detail_attrib_names}]  # Wrap in a list for consistency

        return data            
    # Raise TypeError for unknown types
    raise TypeError("Type not serializable")



def _get_node_type_strings(nt):
    def _get_litegraph_tab_menu(nt):
        ret = None
        definitions = nt.allInstalledDefinitions() or []
        if len(definitions) > 0:
            tools = definitions[0].tools()
            if len(tools) > 0:
                tool = list(tools.values())[0]
                if len(tool.toolMenuLocations())>0:
                    ret = tool.toolMenuLocations()[0] 

        if ret == None:
            ret = 'Other'

        return f"{nt.category().name().upper()}/{ret}"

    # Ensure there are enough components
    components = nt.nameComponents()
    if len(components) < 4:
        raise ValueError("Not enough components in nameComponents")
    s = {
        "category": nt.category().name().upper(),
        "namespace": components[1],
        "name": components[2],
        "version": components[3],
        "type": nt.name(),
        "litegraph": f"{_get_litegraph_tab_menu(nt)}/{nt.name()}",
        "description": nt.description(),
    }
    s['class'] = "_hnt_" + re.sub(r'[^a-zA-Z0-9_]', '_', re.sub(r'^([0-9])', r"_\1", s["category"] + '_' + s['type']))
    
    return s

def sanitize_utf8(s):
    return s.encode('utf-8', errors='replace').decode('utf-8', errors='replace')

def _get_parm_defaults(parmtemp):
    _parm = {
        "type":parmtemp.type().name(),
        "label":sanitize_utf8(parmtemp.label()),
    }
    if hasattr(parmtemp, "minValue"):
        _parm["min"] = parmtemp.minValue()
    if hasattr(parmtemp, "maxValue"):
        _parm["max"] = parmtemp.maxValue()

    if isinstance(parmtemp, hou.MenuParmTemplate) or isinstance(parmtemp, hou.StringParmTemplate) or isinstance(parmtemp, hou.IntParmTemplate):
        menu_items = parmtemp.menuItems()
        menu_labels = parmtemp.menuLabels()
        if len(menu_items) > 0 and len(menu_labels) > 0:
            _parm["menu_items"] = menu_items
            _parm["menu_labels"] = menu_labels

    default = None
    if isinstance(parmtemp, hou.RampParmTemplate):
        x = {}
        for parmtt in parmtemp.parmTemplates():
            x[parmtt.name()] = _get_parm_defaults(parmtt)
        default = x
    elif isinstance(parmtemp, hou.DataParmTemplate): 
        default = parmtemp.defaultExpression()
    else: 
        default = parmtemp.defaultValue()

    _parm["default"] = normalizeList(default)

    if default is None:
        return None
    else:
        return _parm

def _isValueParm(parmTemplate):
    exclude = [
        hou.FolderParmTemplate,
        hou.FolderSetParmTemplate,
        hou.LabelParmTemplate,
        hou.ButtonParmTemplate,
        hou.SeparatorParmTemplate,
    ]
    for temp in exclude:
        if isinstance(parmTemplate, temp):
            return False
        
    return True


def normalizeList(listOrTuple):
    """
    Clean single value tuple or lists and just return the value
    """
    if (isinstance(listOrTuple, tuple) or isinstance(listOrTuple, list)) and len(listOrTuple) == 1:
        listOrTuple = listOrTuple[0]
    return listOrTuple




