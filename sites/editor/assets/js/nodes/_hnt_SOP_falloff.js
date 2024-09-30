
export default function (hou) {
    class _hnt_SOP_falloff extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Attribute/falloff';
        static category = '/SOP';
        static houdiniType = 'falloff';
        static title = 'Falloff';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_falloff.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "geo = hou.pwd().geometry()\n\ngroups = []\nif geo:\n    for group in geo.pointGroups():\n        groupName = group.name()\n        groups += [groupName, groupName]\nreturn groups", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Points,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "hscript"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "outputtype", label: "Type", menu_items: ["raw", "normalized", "unboundedraw"], menu_labels: ["Distance", "Normalized Distance", "Unbounded Distance"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().fixVisualizerAttribute(kwargs, \"maxscalar\", \"rad\")");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().fixVisualizerAttribute(kwargs, \"maxscalar\", \"rad\")", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "distmetric", label: "Distance Metric", menu_items: ["edge", "global", "surface"], menu_labels: ["Edge", "Radius", "Surface"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "rad", label: "Radius", num_components: 1, default_value: [0.5], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ outputtype == unboundedraw }");
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().fixVisualizerAttribute(kwargs, \"maxscalar\", \"rad\")");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().fixVisualizerAttribute(kwargs, \"maxscalar\", \"rad\")", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "reverse", label: "Reverse", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ outputtype == unboundedraw }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "ramppreset", label: "Ramp Presets", menu_items: ["constant", "custom", "hill", "linear", "round", "sharp", "smooth", "steps", "valley"], menu_labels: ["Constant", "Custom", "Hill", "Linear", "Round", "Sharp", "Smooth", "Steps", "Valley"], default_value: 6, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ outputtype != normalized }");
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().setRampPreset(kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().setRampPreset(kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "ramp", label: "Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ outputtype != normalized }");
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().handleRampChange(kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"rampbasisdefault": "monotonecubic", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( monotonecubic ) 2pos ( 1 ) 2value ( 0 ) 2interp ( monotonecubic )", "rampshowcontrolsdefault": "0", "script_callback": "hou.pwd().hdaModule().handleRampChange(kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "output", label: "Output", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "mix", label: "Mix Method", menu_items: ["max", "min", "none", "overwrite"], menu_labels: ["Maximum", "Minimum", "None", "Overwrite"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputdist", label: "Output Distance", default_value: true});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"Output": "output"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "distattr", label: "Distance Attribute", num_components: 1, default_value: ["falloff"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ outputdist == 0 }");
			hou_parm_template2.setScriptCallback("hou.pwd().hdaModule().fixVisualizerAttribute(kwargs, \"attrib\", \"distattr\")");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"Output": "output", "script_callback": "hou.pwd().hdaModule().fixVisualizerAttribute(kwargs, \"attrib\", \"distattr\")", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputleadpt", label: "Output Lead Point", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "leadptattr", label: "Lead Point Attribute", num_components: 1, default_value: ["falloff_leadpt"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ outputleadpt == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputgroup", label: "Output Group", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "falloffgroup", label: "Inside Radius Group", num_components: 1, default_value: ["insideRad"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ outputgroup == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "node_vis_enabled", label: "Visualization Enabled", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "num_visualizers", label: "Visualizers", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"multistartoffset": "0"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "vis_active#", label: "Active #", default_value: true});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vis_data#", label: "Raw Data #", num_components: 1, default_value: ["{\n        \"flags\":{\n                \"type\":\"int\",\n                \"value\":24\n        },\n        \"icon\":{\n                \"type\":\"string\",\n                \"value\":\"SOP_color\"\n        },\n        \"label\":{\n                \"type\":\"string\",\n                \"value\":\"Soft Falloff\"\n        },\n        \"name\":{\n                \"type\":\"string\",\n                \"value\":\"vis_falloff_hda\"\n        },\n        \"parameters\":{\n                \"type\":\"string\",\n                \"value\":\"{\\nversion 0.8\\ncolortype\\t[ 0\\tlocks=0 ]\\t(\\t\\\"attribramped\\\"\\t)\\nclass\\t[ 0\\tlocks=0 ]\\t(\\t\\\"auto\\\"\\t)\\nattrib\\t[ 0\\tlocks=0 ]\\t(\\tfalloff\\t)\\nuvattrib\\t[ 0\\tlocks=0 ]\\t(\\tuv\\t)\\ndistortiontype\\t[ 0\\tlocks=0 ]\\t(\\t\\\"global\\\"\\t)\\nrangesection\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\nrangespec\\t[ 0\\tlocks=0 ]\\t(\\t\\\"min-max\\\"\\t)\\nminscalar\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\nmaxscalar\\t[ 0\\tlocks=0 ]\\t(\\t1\\t)\\ncenterscalar\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\nwidthscalar\\t[ 0\\tlocks=0 ]\\t(\\t1\\t)\\nclamptype\\t[ 0\\tlocks=0 ]\\t(\\t\\\"edge\\\"\\t)\\nconstcolor\\t[ 0\\tlocks=0 ]\\t(\\t1\\t0\\t0\\t1\\t)\\nusethreevtxcolor\\t[ 0\\tlocks=0 ]\\t(\\t\\\"on\\\"\\t)\\ncolorthreevtx\\t[ 0\\tlocks=0 ]\\t(\\t1\\t1\\t0\\t)\\nusefourvtxcolor\\t[ 0\\tlocks=0 ]\\t(\\t\\\"on\\\"\\t)\\ncolorfourvtx\\t[ 0\\tlocks=0 ]\\t(\\t0.5\\t0.69999999999999996\\t1\\t)\\nusenvtxcolor\\t[ 0\\tlocks=0 ]\\t(\\t\\\"on\\\"\\t)\\ncolornvtx\\t[ 0\\tlocks=0 ]\\t(\\t1\\t0\\t0\\t)\\ntreatasscalar\\t[ 0\\tlocks=0 ]\\t(\\t\\\"off\\\"\\t)\\nusing\\t[ 0\\tlocks=0 ]\\t(\\t\\\"comp\\\"\\t)\\ncomponent\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\nrefvec\\t[ 0\\tlocks=0 ]\\t(\\t0\\t1\\t0\\t)\\nrandseed\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\nvalsep\\t[ 0\\tlocks=0 ]\\t(\\t1\\t)\\nrampsection\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\ncolorramppreset\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\ncolorramp\\t[ 0\\tlocks=0 ]\\t(\\t4\\t)\\ncolorramp1pos\\t[ 0\\tlocks=0 ]\\t(\\t0\\t)\\ncolorramp1c\\t[ 0\\tlocks=0 ]\\t(\\t1\\t1\\t1\\t)\\ncolorramp1interp\\t[ 0\\tlocks=0 ]\\t(\\t\\\"linear\\\"\\t)\\ncolorramp2pos\\t[ 0\\tlocks=0 ]\\t(\\t0.48399999737739563\\t)\\ncolorramp2c\\t[ 0\\tlocks=0 ]\\t(\\t0.89999997615814209\\t0.66992402076721191\\t0.0036000071559101343\\t)\\ncolorramp2interp\\t[ 0\\tlocks=0 ]\\t(\\t\\\"linear\\\"\\t)\\ncolorramp3pos\\t[ 0\\tlocks=0 ]\\t(\\t0.86682808399200439\\t)\\ncolorramp3c\\t[ 0\\tlocks=0 ]\\t(\\t1\\t0\\t0\\t)\\ncolorramp3interp\\t[ 0\\tlocks=0 ]\\t(\\t\\\"linear\\\"\\t)\\ncolorramp4pos\\t[ 0\\tlocks=0 ]\\t(\\t1\\t)\\ncolorramp4c\\t[ 0\\tlocks=0 ]\\t(\\t1\\t0\\t0\\t)\\ncolorramp4interp\\t[ 0\\tlocks=0 ]\\t(\\t\\\"linear\\\"\\t)\\n}\\n\"},\n        \n        \"scope\":{\n                \"type\":\"int\",\n                \"value\":2\n        },\n        \"type\":{\n                \"type\":\"string\",\n                \"value\":\"vis_color\"\n        }\n}"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.hide(true);
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"editor": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Attribute/falloff',_hnt_SOP_falloff)
    return _hnt_SOP_falloff
}
        