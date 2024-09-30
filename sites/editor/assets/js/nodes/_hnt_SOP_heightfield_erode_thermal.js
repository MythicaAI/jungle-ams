
export default function (hou) {
    class _hnt_SOP_heightfield_erode_thermal extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Environments/Terrain/heightfield_erode_thermal';
        static category = '/SOP';
        static houdiniType = 'heightfield_erode_thermal';
        static title = 'HeightField Erode Thermal';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_heightfield_erode_thermal.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Erosion", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "globalerosionrate", label: "Global Erosion Rate", num_components: 1, default_value: [5], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"units": "m1frame-1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "erodability", label: "Erodability", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "erodabilitymaskmode", label: "erodabilitymaskmode", menu_items: ["maskoff", "maskon"], menu_labels: ["Mask Off", "Mask On"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"export_disable": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "erodabilitymasklayer", label: "Erodability Mask", num_components: 1, default_value: ["erodabilitymask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'], input_num=1)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 0 } { erodabilitymaskmode == maskoff }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ erodabilitymaskmode == maskoff }");
			hou_parm_template2.setTags({"script_action": "import terraintoolutils\n\nterraintoolutils.createMaskPaint(kwargs, layername=kwargs['node'].parm('erodabilitymasklayer').eval(), input_num=1)", "script_action_help": "Add an Erodability Mask Paint", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "erosionrate", label: "Erosion Rate", num_components: 1, default_value: [0.35], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "cutangle", label: "Cut Angle", num_components: 1, default_value: [30], min: 0, max: 90, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "cutanglemaskmode", label: "cutanglemaskmode", menu_items: ["maskoff", "maskon"], menu_labels: ["Mask Off", "Mask On"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"export_disable": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "cutanglemasklayer", label: "Cut Angle Mask", num_components: 1, default_value: ["cutanglemask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'], input_num=1)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 0 } { cutanglemaskmode == maskoff }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ cutanglemaskmode == maskoff }");
			hou_parm_template2.setTags({"script_action": "import terraintoolutils\n\nterraintoolutils.createMaskPaint(kwargs, layername=kwargs['node'].parm('cutanglemasklayer').eval(), input_num=1)", "script_action_help": "Add a Cut Angle Mask Paint", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "removalrate", label: "Removal Rate", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "removalratemaskmode", label: "removalratemaskmode", menu_items: ["maskoff", "maskon"], menu_labels: ["Mask Off", "Mask On"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"export_disable": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "removalratemasklayer", label: "Removal Rate Mask", num_components: 1, default_value: ["removalratemask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'], input_num=1)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 0 } { removalratemaskmode == maskoff }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ removalratemaskmode == maskoff }");
			hou_parm_template2.setTags({"script_action": "import terraintoolutils\n\nterraintoolutils.createMaskPaint(kwargs, layername=kwargs['node'].parm('removalratemasklayer').eval(), input_num=1)", "script_action_help": "Add a Removal Rate Mask Paint", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "maxdebrisdepth", label: "Max Debris Depth", num_components: 1, default_value: [5], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "gridbias", label: "Grid Bias", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "gridbiasmaskmode", label: "gridbiasmaskmode", menu_items: ["maskoff", "maskon"], menu_labels: ["Mask Off", "Mask On"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"export_disable": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "gridbiasmasklayer", label: "Grid Bias Mask", num_components: 1, default_value: ["gridbiasmask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'], input_num=1)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 0 } { gridbiasmaskmode == maskoff }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ gridbiasmaskmode == maskoff }");
			hou_parm_template2.setTags({"script_action": "import terraintoolutils\n\nterraintoolutils.createMaskPaint(kwargs, layername=kwargs['node'].parm('gridbiasmasklayer').eval(), input_num=1)", "script_action_help": "Add a Grid Bias Mask Paint", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "seed", label: "Random Seed", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1_1", label: "Flow", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "quant", label: "Quantization", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "iterations", label: "Spread Iterations", num_components: 1, default_value: [50], min: 0, max: 100, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "reposeangle", label: "Repose Angle", num_components: 1, default_value: [0], min: 0, max: 90, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ doerosion == 1 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "reposeanglemaskmode", label: "reposeanglemaskmode", menu_items: ["maskoff", "maskon"], menu_labels: ["Mask Off", "Mask On"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"export_disable": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "reposeanglemasklayer", label: "Repose Angle Mask", num_components: 1, default_value: ["reposeanglemask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'], input_num=1)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 0 } { reposeanglemaskmode == maskoff }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ reposeanglemaskmode == maskoff }");
			hou_parm_template2.setTags({"script_action": "import terraintoolutils\n\nterraintoolutils.createMaskPaint(kwargs, layername=kwargs['node'].parm('reposeanglemasklayer').eval(), input_num=1)", "script_action_help": "Add a Repose Angle Mask Paint", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "stabilitymasklayer", label: "Stability Mask", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1_2", label: "Layer Bindings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "materiallayer", label: "Material Layer", num_components: 1, default_value: ["debris"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "erodinglayer", label: "Eroding Layer", num_components: 1, default_value: ["height"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "belowlayers", label: "Below Layers", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "bedrocklayer", label: "Bedrock Layer", num_components: 1, default_value: ["bedrock"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1_3", label: "Strata", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "dostrata", label: "Adjust Erodability by Strata", default_value: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "strata_depth", label: "Strata Depth", num_components: 1, default_value: [10], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ dostrata == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "strata_clamp", label: "Clamp at Strata Bounds", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ dostrata == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "strata_ramp", label: "Strata Erodability", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ dostrata == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampshowcontrolsdefault": "0"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Environments/Terrain/heightfield_erode_thermal',_hnt_SOP_heightfield_erode_thermal)
    return _hnt_SOP_heightfield_erode_thermal
}
        