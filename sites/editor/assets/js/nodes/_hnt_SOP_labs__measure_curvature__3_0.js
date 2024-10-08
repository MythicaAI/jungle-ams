
export default function (hou) {
    class _hnt_SOP_labs__measure_curvature__3_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Analysis/labs::measure_curvature::3.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::measure_curvature::3.0';
        static title = 'Labs Measure Curvature';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__measure_curvature__3_0.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "fd_curvaturevalues", label: "Curvature Values", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "method", label: "Method", menu_items: ["0", "1", "2", "3", "4", "5", "6"], menu_labels: ["Volume Analysis", "Polynomial Fitting", "Tensor (Integral)", "Tensor (Euler)", "Shape Operator", "Approx Shape Operator", "Measure"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "voxelsize", label: "Voxel Size", num_components: 1, default_value: [0.01], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Logarithmic, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ method != 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "viscolor", label: "Export Color", default_value: true});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "singlecolor", label: "Single Color", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ viscolor == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "perpiece", label: "Per Piece", default_value: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "pieceattr", label: "Piece Attribute", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ perpiece == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_convexadjustment", label: "Convex Adjustment", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "convexityattr", label: "Attribute", num_components: 1, default_value: ["convexity"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soputils\nsoputils.actionToggleVisualizer(kwargs,\n{ 'type': hou.viewportVisualizers.type('vis_color'),\n'parms': {\n    'colortype': 'attribramped',\n    'rangespec': 'auto',\n    'minscalar': 0,\n    'maxscalar': 1,\n    'treatasscalar': True,\n    'using': 'compabs',\n    'component': 0,\n    'colorramp': hou.Ramp((hou.rampBasis.Linear,\n                           hou.rampBasis.Linear),\n                           (0, 1),\n                           ((1, 1, 1), (1, 0, 0)))\n} })", "script_action_help": "Toggle visualization Ctrl-LMB: Open the visualization editor", "script_action_icon": "VIEW_visualization", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "convexintensity", label: "Intensity", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "convexblur", label: "Blur Amount", num_components: 1, default_value: [1], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "convexramp", label: "Remap Range", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_concaveadjustment", label: "Concave Adjustment", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "concavityattr", label: "Attribute", num_components: 1, default_value: ["concavity"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soputils\nsoputils.actionToggleVisualizer(kwargs,\n{ 'type': hou.viewportVisualizers.type('vis_color'),\n'parms': {\n    'colortype': 'attribramped',\n    'rangespec': 'auto',\n    'minscalar': 0,\n    'maxscalar': 1,\n    'treatasscalar': True,\n    'using': 'compabs',\n    'component': 0,\n    'colorramp': hou.Ramp((hou.rampBasis.Linear,\n                           hou.rampBasis.Linear),\n                           (0, 1),\n                           ((1, 1, 1), (1, 0, 0)))\n} })", "script_action_help": "Toggle visualization Ctrl-LMB: Open the visualization editor", "script_action_icon": "VIEW_visualization", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "concaveintensity", label: "Intensity", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "concaveblur", label: "Blur Amount", num_components: 1, default_value: [1], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "concaveramp", label: "Remap Range", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Analysis/labs::measure_curvature::3.0',_hnt_SOP_labs__measure_curvature__3_0)
    return _hnt_SOP_labs__measure_curvature__3_0
}
        