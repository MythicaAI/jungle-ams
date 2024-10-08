
export default function (hou) {
    class _hnt_SOP_labs__loop_volume__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/FX/Time/labs::loop_volume::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::loop_volume::1.0';
        static title = 'Labs Loop Volume';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__loop_volume__1_0.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "f", label: "Frame Range", num_components: 2, default_value: [0, 0], default_expression: ["$FSTART", "$FEND"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "overlaysource", label: "Overlay Sequence", menu_items: ["0", "1"], menu_labels: ["Self", "Second Input"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "blendmode", label: "Blend Mode", menu_items: ["0", "1", "2"], menu_labels: ["Add", "Maximum", "Average"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "nonuniformfade", label: "Density Affects Cross-Fade Curves", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "densityrange", label: "Density Range", num_components: 2, default_value: [0, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ nonuniformfade == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_general", label: "Sequence Cross-Fade", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.LabelParmTemplate({name: "lb_lowdensity", label: "lb_lowdensity", column_labels: ["Lower Density Areas"]});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ nonuniformfade == 0 }");
			hou_parm_template2.setTags({"sidefx::look": "heading"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "blendrampa", label: "Base Sequence Cross-Fade", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"rampbasisdefault": "monotonecubic", "rampfloatdefault": "1pos ( 0.004999999888241291 ) 1value ( 0 ) 1interp ( monotonecubic ) 2pos ( 0.49500000476837158 ) 2value ( 1 ) 2interp ( monotonecubic ) 3pos ( 0.50499999523162842 ) 3value ( 1 ) 3interp ( monotonecubic ) 4pos ( 0.99500000476837158 ) 4value ( 0 ) 4interp ( monotonecubic )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "blendrampb", label: "Overlay Sequence Cross-Fade", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"rampbasisdefault": "monotonecubic", "rampfloatdefault": "1pos ( 0.004999999888241291 ) 1value ( 1 ) 1interp ( monotonecubic ) 2pos ( 0.49500000476837158 ) 2value ( 0 ) 2interp ( monotonecubic ) 3pos ( 0.50499999523162842 ) 3value ( 0 ) 3interp ( monotonecubic ) 4pos ( 0.99500000476837158 ) 4value ( 1 ) 4interp ( monotonecubic )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm3"});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ nonuniformfade == 0 }");
			hou_parm_template2.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.LabelParmTemplate({name: "lb_highdensity", label: "lb_highdensity", column_labels: ["Higher Density Areas"]});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ nonuniformfade == 0 }");
			hou_parm_template2.setTags({"sidefx::look": "heading"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "blendrampa_high", label: "Base Sequence Cross-Fade", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ nonuniformfade == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"rampbasisdefault": "monotonecubic", "rampfloatdefault": "1pos ( 0.05000000074505806 ) 1value ( 0 ) 1interp ( monotonecubic ) 2pos ( 0.44999998807907104 ) 2value ( 1 ) 2interp ( monotonecubic ) 3pos ( 0.55000001192092896 ) 3value ( 1 ) 3interp ( monotonecubic ) 4pos ( 0.94999998807907104 ) 4value ( 0 ) 4interp ( monotonecubic )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "blendrampb_high", label: "Overlay Sequence Cross-Fade", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ nonuniformfade == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"rampbasisdefault": "monotonecubic", "rampfloatdefault": "1pos ( 0.05000000074505806 ) 1value ( 1 ) 1interp ( monotonecubic ) 2pos ( 0.44999998807907104 ) 2value ( 0 ) 2interp ( monotonecubic ) 3pos ( 0.55000001192092896 ) 3value ( 0 ) 3interp ( monotonecubic ) 4pos ( 0.94999998807907104 ) 4value ( 1 ) 4interp ( monotonecubic )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_general_1", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_visibility", label: "Visibility Estimation", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "visw_density", label: "Density Weight", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "visw_temp", label: "Temperature Weight", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "visw_flame", label: "Flame Weight", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "visw_scatter", label: "Scatter Weight", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "previewmv", label: "Preview Motion Vectors", default_value: false});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_vols", label: "Volume Bindings", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "vol_density", label: "Density Volume", num_components: 1, default_value: ["density"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "vol_cd", label: "Diffuse Color Volume", num_components: 1, default_value: ["Cd"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "vol_temp", label: "Temperature Volume", num_components: 1, default_value: ["temperature"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "vol_flame", label: "Flame Volume", num_components: 1, default_value: ["flame"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "vol_scatter", label: "Scatter Volume", num_components: 1, default_value: ["scatter"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "vol_ce", label: "Emission Color Volume", num_components: 1, default_value: ["Ce"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "vol_vel", label: "Velocity Volume", num_components: 1, default_value: ["vel"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/FX/Time/labs::loop_volume::1.0',_hnt_SOP_labs__loop_volume__1_0)
    return _hnt_SOP_labs__loop_volume__1_0
}
        