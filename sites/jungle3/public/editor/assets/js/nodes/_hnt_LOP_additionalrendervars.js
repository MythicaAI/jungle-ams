
export default function (hou) {
    class _hnt_LOP_additionalrendervars extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Rendering/additionalrendervars';
        static category = '/LOP';
        static houdiniType = 'additionalrendervars';
        static title = 'Additional Render Vars';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_additionalrendervars.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "parentprimpath", label: "Parent Primitive Path", num_components: 1, default_value: ["/Render/Products/Vars"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPathMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane. Ctrl-click to select using the primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "script_callback": "", "script_callback_language": "python", "sidefx::usdpathtype": "prim"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "rendervars", label: "Render Vars", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "enable#", label: "Enable", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder0_#", label: "Render Var", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "name#", label: "Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs[\"node\"].hm().getAOVMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setScriptCallback("kwargs[\"node\"].hm().setAOV(kwargs)");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback": "kwargs[\"node\"].hm().setAOV(kwargs)", "script_callback_language": "python", "usdvaluetype": "string"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "format#", label: "Format", num_components: 1, default_value: ["float"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l additional_rendervars xn__driverparametersaovformat_shbkd", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ name# == \\\"\\\" }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "usdvaluetype": "string"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "multisampled#", label: "Multi Sampled", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ name# == \\\"\\\" }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "usdvaluetype": "bool"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "clearvalue#", label: "Clear Value", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ name# == \\\"\\\" }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "usdvaluetype": "int"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "dataType#", label: "Data Type", num_components: 1, default_value: ["color3f"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l additional_rendervars dataType", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ name# == \\\"\\\" }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "usdvaluetype": "token"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "sourceName#", label: "Source Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "retval = [\"_separator_\", \"---------\"]\n\nretval += [\"C.*\", \"LPE:Beauty\"]\nretval += [\"unoccluded;C.*\", \"LPE:Beauty Unshadowed\"]\nretval += [\"C<RD>.*\", \"LPE:Combined Diffuse\"]\nretval += [\"C<RD>L\", \"LPE:Direct Diffuse\"]\nretval += [\"C<RD>.+L\", \"LPE:Indirect Diffuse\"]\nretval += [\"unoccluded;C<RD>.*\", \"LPE:Combined Diffuse Unshadowed\"]\nretval += [\"unoccluded;C<RD>L\", \"LPE:Direct Diffuse Unshadowed\"]\nretval += [\"unoccluded;C<RD>.+L\", \"LPE:Indirect Diffuse Unshadowed\"]\nreturn retval", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ name# == \\\"\\\" }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "usdvaluetype": "string"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "sourceType#", label: "Source Type", num_components: 1, default_value: ["raw"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["raw", "primvar", "lpe", "intrinsic"], menu_labels: ["Raw", "Primvar", "LPE", "Intrinsic"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ name# == \\\"\\\" }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "usdvaluetype": "token"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "folder0_#_2", label: "Karma", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template3.setTabConditional(hou.parmCondType.DisableWhen, "{ name# == \\\"\\\" }");
			let hou_parm_template4 = new hou.StringParmTemplate({name: "filter#", label: "Pixel Filter", num_components: 1, default_value: ["[\"ubox\",{}]"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["[\"ubox\",{}]", "[\"gauss\",{\"width\":2}]", "[\"gauss\",{\"width\":3}]", "[\"barlett\", {\"width\":2}]", "[\"catrom\",{\"width\":3}]", "[\"hanning\", {\"width\":2}]", "[\"blackman\", {\"width\":2}]", "[\"sinc\", {\"width\":3}]", "[\"edgedetect\", {}]", "[\"minmax\",{\"mode\":\"min\"}]", "[\"minmax\",{\"mode\":\"max\"}]", "[\"minmax\",{\"mode\":\"median\"}]", "[\"minmax\",{\"mode\":\"edge\"}]", "[\"minmax\",{\"mode\":\"ocover\"}]", "[\"minmax\",{\"mode\":\"idcover\"}]", "[\"minmax\",{\"mode\":\"omin\"}]", "[\"minmax\",{\"mode\":\"omax\"}]", "[\"minmax\",{\"mode\":\"omedian\"}]"], menu_labels: ["Unit Box Filter", "Gaussian 2x2", "Gaussian 3x3 (softer)", "Barlett (triangle)", "Catmull-Rom 3x3", "Hanning", "Blackman", "Sinc (sharpening)", "Edge Detection Filter", "Sample: Minimum Value", "Sample: Maximum Value", "Sample: Median Value", "Disable Edge Antialiasing", "Object With Most Pixel Coverage (average)", "Object With Most Coverage (no filtering)", "Object With Most Coverage (minimum z-value)", "Object With Most Coverage (maximum z-value)", "Object With Most Coverage (median z-value)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "spare_category": "Image", "uiscope": "None", "usdvaluetype": "string"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "cryptomatte#", label: "Cryptomatte", default_value: false});
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "cryptomatterank#", label: "Overlap Limit", num_components: 1, default_value: [6], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ cryptomatte# == 0 }");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "cryptomattesidecar#", label: "Manifest File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ cryptomatte# == 0 }");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "dooutputcs#", label: "Output Colorspace", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template4.hideLabel(true);
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "outputcs#", label: "Output Colorspace", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').ocioColorSpaceMenu()\")`", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ dooutputcs# == 0 }");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Rendering/additionalrendervars',_hnt_LOP_additionalrendervars)
    return _hnt_LOP_additionalrendervars
}
        