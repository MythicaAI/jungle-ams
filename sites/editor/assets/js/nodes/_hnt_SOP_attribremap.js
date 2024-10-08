
export default function (hou) {
    class _hnt_SOP_attribremap extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Attribute/attribremap';
        static category = '/SOP';
        static houdiniType = 'attribremap';
        static title = 'Attribute Remap';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_attribremap.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a attribwrangle1 group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('grouptype')\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect", "script_callback": "", "script_callback_language": "hscript"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "grouptype", label: "Group Type", menu_items: ["guess", "vertices", "edges", "points", "prims"], menu_labels: ["Guess from Group", "Vertices", "Edges", "Points", "Primitives"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "class", label: "Class", menu_items: ["detail", "primitive", "point", "vertex"], menu_labels: ["Detail", "Primitive", "Point", "Vertex"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "inname", label: "Original Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "r = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:\n        c = node.parm('class').evalAsString()\n        if c == 'detail':\n            attrs = geo.globalAttribs()\n        elif c == 'primitive':\n            attrs = geo.primAttribs()\n        elif c == 'point':\n            attrs = geo.pointAttribs()\n        else: # vertex\n            attrs = geo.vertexAttribs()\n        for a in attrs:\n            if a.dataType() == hou.attribData.Float and not a.isArrayType() and a.size() == 1:\n                r.extend([a.name(), a.name()])\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "outname", label: "New Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "r = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:\n        c = node.parm('class').evalAsString()\n        if c == 'detail':\n            attrs = geo.globalAttribs()\n        elif c == 'primitive':\n            attrs = geo.primAttribs()\n        elif c == 'point':\n            attrs = geo.pointAttribs()\n        else: # vertex\n            attrs = geo.vertexAttribs()\n        for a in attrs:\n            if a.dataType() == hou.attribData.Float and not a.isArrayType() and a.size() == 1:\n                r.extend([a.name(), a.name()])\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"script_action": "from soputils import actionToggleVisualizer\nname = kwargs['node'].parm('outname').eval()\nif not name:\n    name = kwargs['node'].parm('inname').eval()\nkwargs['attribname'] = name\nactionToggleVisualizer(kwargs)\n", "script_action_help": "Toggle visualization\nCtrl-LMB: Open the visualization editor", "script_action_icon": "VIEW_visualization"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "computerange", label: "Compute Range"});
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().computeRange(kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().computeRange(kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "inputmin", label: "Input Min", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "inputmax", label: "Input Max", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "outputmin", label: "Output Min", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "outputmax", label: "Output Max", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "clamptype", label: "Out of Range Values", menu_items: ["edge", "linear", "cycle"], menu_labels: ["Clamp to Edge Value", "Linearly Extrapolate", "Roll Cyclically"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "useramp", label: "Use Ramp", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ clamptype == linear }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "remap", label: "Remap", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useramp == 0 } { clamptype == linear }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Attribute/attribremap',_hnt_SOP_attribremap)
    return _hnt_SOP_attribremap
}
        