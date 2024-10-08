
export default function (hou) {
    class _hnt_SOP_kinefx__jointcaptureproximity extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Animation/Rigging/kinefx::jointcaptureproximity';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::jointcaptureproximity';
        static title = 'Joint Capture Proximity';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__jointcaptureproximity.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
            const outputs = ['SOP', 'SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a captureproximity1 group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Points,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "capturegroup", label: "Capture Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "from kinefx.ui.jointselection import buildTransformMenu\nreturn buildTransformMenu(kwargs[\'node\'].node(\"CAPTURE_POSE\"), is_motionclip=False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "from kinefx.ui import rigtreeutils\nrigtreeutils.selectPointGroupParm(kwargs, inputindex=1)", "script_action_help": "Select points from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "weightmethod", label: "Weighting Method", menu_items: ["weightClosestRegionObject", "weightClosestConnectingRegionObject"], menu_labels: ["Closest Joint", "Closest Connected Joint"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "weightfrom", label: "Weight From", menu_items: ["cv", "surface"], menu_labels: ["Points", "Surface"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dropoff", label: "Drop Off", num_components: 1, default_value: [1], min: 0.001, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "maxinfluences", label: "Max. Influences", num_components: 1, default_value: [2], min: 1, max: 30, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "doblend", label: "Do Blend", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "blendfactor", label: "Blend Factor", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ doblend == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "normweights", label: "Normalize Weights", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "node_vis_enabled", label: "Visualization Enabled", default_value: true});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "num_visualizers", label: "Visualizers", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"multistartoffset": "0"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "vis_active#", label: "Active #", default_value: true});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vis_data#", label: "Raw Data #", num_components: 1, default_value: ["{\n\t\"flags\":{\n\t\t\"type\":\"int\",\n\t\t\"value\":27\n\t},\n\t\"icon\":{\n\t\t\"type\":\"string\",\n\t\t\"value\":\"SOP_capture\"\n\t},\n\t\"label\":{\n\t\t\"type\":\"string\",\n\t\t\"value\":\"Capture Weights 1\"\n\t},\n\t\"name\":{\n\t\t\"type\":\"string\",\n\t\t\"value\":\"vis_captureweight_1\"\n\t},\n\t\"parameters\":{\n\t\t\"type\":\"string\",\n\t\t\"value\":\"{\\\\nversion 0.8\\\\nupstream\\\\t[ 0\\\\tlocks=0 ]\\\\t(\\\\t\\\\\"off\\\\\"\\\\t)\\\\ncaptposeinput\\\\t[ 0\\\\tlocks=0 ]\\\\t(\\\\t1\\\\t)\\\\nbonemode\\\\t[ 0\\\\tlocks=0 ]\\\\t(\\\\t\\\\\"multibone\\\\\"\\\\t)\\\\ncregion\\\\t[ 0\\\\tlocks=0 ]\\\\t(\\\\tfoot_l\\\\t)\\\\nvisualizemode\\\\t[ 0\\\\tlocks=0 ]\\\\t(\\\\t\\\\\"false\\\\\"\\\\t)\\\\nnormalized\\\\t[ 0\\\\tlocks=0 ]\\\\t(\\\\t\\\\\"off\\\\\"\\\\t)\\\\nuserandomcolors\\\\t[ 0\\\\tlocks=0 ]\\\\t(\\\\t\\\\\"on\\\\\"\\\\t)\\\\n}\\\\n\"\n\t},\n\t\"scope\":{\n\t\t\"type\":\"int\",\n\t\t\"value\":0\n\t},\n\t\"type\":{\n\t\t\"type\":\"string\",\n\t\t\"value\":\"vis_captureweight\"\n\t}\n}\n"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.hide(true);
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"editor": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Animation/Rigging/kinefx::jointcaptureproximity',_hnt_SOP_kinefx__jointcaptureproximity)
    return _hnt_SOP_kinefx__jointcaptureproximity
}
        