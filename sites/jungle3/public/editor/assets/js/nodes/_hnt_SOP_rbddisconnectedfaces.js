
export default function (hou) {
    class _hnt_SOP_rbddisconnectedfaces extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/RBD/rbddisconnectedfaces';
        static category = '/SOP';
        static houdiniType = 'rbddisconnectedfaces';
        static title = 'RBD Disconnected Faces';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_rbddisconnectedfaces.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a groupcombine group_b1", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs[\'geometrytype\'] = kwargs[\'node\'].node(\"delete_inside_faces__primitive_mode\").parmTuple(\'grouptype\')\nkwargs[\'inputindex\'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "interiorgroup", label: "Interior Group", num_components: 1, default_value: ["inside"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a groupcombine group_b1", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ attributetype == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs[\'geometrytype\'] = kwargs[\'node\'].node(\"delete_inside_faces__primitive_mode\").parmTuple(\'grouptype\')\nkwargs[\'inputindex\'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "attributetype", label: "Attribute Type", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["Primitive", "Vertex"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "faceattribute", label: "Face Attribute", num_components: 1, default_value: ["oppositefaceid"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\"node\"]\nattype = node.evalParm(\"attributetype\")\nretval = []\ninputs = node.inputs()\nif inputs:\n    geo = inputs[0].geometry()\n    if attype == 0:\n        for attrib in sorted([x.name() for x in geo.primAttribs() if \\\n            x.dataType() == hou.attribData.Int and x.size() == 1]):\n            retval += [attrib] * 2\n    else:\n        for attrib in sorted([x.name() for x in geo.vertexAttribs() if \\\n            x.dataType() == hou.attribData.Int and x.size() == 1]):\n            retval += [attrib] * 2\nreturn retval", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usefacename", label: "Use Face Name", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "facenameattribute", label: "Face Name Attribute", num_components: 1, default_value: ["oppositefacename"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\"node\"]\nattype = node.evalParm(\"attributetype\")\nretval = []\ninputs = node.inputs()\nif inputs:\n    geo = inputs[0].geometry()\n    if attype == 0:\n        for attrib in sorted([x.name() for x in geo.primAttribs() if \\\n            x.dataType() == hou.attribData.String]):\n            retval += [attrib] * 2\n    else:\n        for attrib in sorted([x.name() for x in geo.vertexAttribs() if \\\n            x.dataType() == hou.attribData.String]):\n            retval += [attrib] * 2\nreturn retval", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usefacename == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "distanceattribute", label: "Distance Attribute", num_components: 1, default_value: ["primdist"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\"node\"]\nattype = node.evalParm(\"attributetype\")\nretval = []\ngeo = None\ninputs = node.inputs()\nif inputs:\n    geo = inputs[0].geometry()\n    if attype == 0:\n        for attrib in sorted([x.name() for x in geo.primAttribs() if \\\n            x.dataType() == hou.attribData.Float and x.size() == 1]):\n            retval += [attrib] * 2\n    else:\n        for attrib in sorted([x.name() for x in geo.vertexAttribs() if \\\n            x.dataType() == hou.attribData.Float and x.size() == 1]):\n            retval += [attrib] * 2\nreturn retval", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "distancethreshold", label: "Distance Threshold", num_components: 1, default_value: [0.0005], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "mode", label: "Mode", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1", "2"], menu_labels: ["Create Attribute", "Delete Connected", "Delete Disconnected"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "disconnectedattribute", label: "Disconnected Attribute", num_components: 1, default_value: ["disconnected"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ mode != 0 }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/RBD/rbddisconnectedfaces',_hnt_SOP_rbddisconnectedfaces)
    return _hnt_SOP_rbddisconnectedfaces
}
        