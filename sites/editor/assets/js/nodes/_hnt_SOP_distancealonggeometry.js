
export default function (hou) {
    class _hnt_SOP_distancealonggeometry extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Geometry/Analysis/distancealonggeometry';
        static category = '/SOP';
        static houdiniType = 'distancealonggeometry';
        static title = 'Distance along Geometry';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_distancealonggeometry.svg';
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
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('grouptype')\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "grouptype", label: "Group Type", menu_items: ["guess", "vertices", "edges", "points", "prims"], menu_labels: ["Guess from Group", "Vertices", "Edges", "Points", "Primitives"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "startpts", label: "Start Points", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "result = []\ngeo = hou.pwd().geometry()\nif geo:\n    for name in sorted([ g.name() for g in geo.pointGroups() ]):\n        result.append(name)\n        result.append(name)\nreturn result", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Points,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "distmetric", label: "Distance Metric", menu_items: ["edge", "surface", "heat"], menu_labels: ["Edge", "Surface", "Heat Geodesic"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "enableoutattrib", label: "Enable Attribute", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "outattrib", label: "Output Attribute", num_components: 1, default_value: ["dist"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "result = []\ninputs = hou.pwd().inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:\n        for name in sorted([ a.name() for a in geo.pointAttribs() if a.dataType() == hou.attribData.Float and not a.isArrayType() and a.size() == 1 ]):\n            result.append(name)\n            result.append(name)\nreturn result", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ enableoutattrib == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nsoputils.actionToggleVisualizer(kwargs, soputils.getDistanceVisualizerDefaults())\n", "script_action_help": "Toggle visualization\nCtrl-LMB: Open the visualization editor", "script_action_icon": "VIEW_visualization"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "enableoutmask", label: "Enable Mask", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "outmask", label: "Output Mask", num_components: 1, default_value: ["mask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "result = []\ninputs = hou.pwd().inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:\n        for name in sorted([ a.name() for a in geo.pointAttribs() if a.dataType() == hou.attribData.Float and not a.isArrayType() and a.size() == 1 ]):\n            result.append(name)\n            result.append(name)\nreturn result", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ enableoutmask == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nsoputils.actionToggleVisualizer(kwargs, soputils.getMaskVisualizerDefaults())\n", "script_action_help": "Toggle visualization\nCtrl-LMB: Open the visualization editor", "script_action_icon": "VIEW_visualization"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "radiusfrom", label: "Radius From", menu_items: ["parm", "maxdist"], menu_labels: ["Parameter", "Maximum Distance"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ enableoutmask == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "rad", label: "Radius", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ enableoutmask == 0 } { radiusfrom != parm }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "remap", label: "Remap", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ enableoutmask == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( monotonecubic ) 2pos ( 1 ) 2value ( 0 ) 2interp ( monotonecubic )"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Geometry/Analysis/distancealonggeometry',_hnt_SOP_distancealonggeometry)
    return _hnt_SOP_distancealonggeometry
}
        