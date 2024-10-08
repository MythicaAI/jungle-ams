
export default function (hou) {
    class _hnt_SOP_labs__validate_geometry_type__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Pipeline/Data Processing/labs::validate_geometry_type::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::validate_geometry_type::1.0';
        static title = 'Labs Validate Geometry Type';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__validate_geometry_type__1_0.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "fd_geo", label: "Number of Types", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "geotype#", label: "Geometry Type", num_components: 1, default_value: ["Point"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["Point", "Poly", "Volume", "VDB", "NURBCurve", "BezierCurve", "MetaBall"], menu_labels: ["Point", "Polygon", "Volume", "VDB", "NURBS Curve ", "Bezier Curve", "Metaball"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "comparison#", label: "Expected", num_components: 1, default_value: ["equal"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["equal", "not equal", "_separator_", "greater", "greateroequal", "less", "lessoequal", "_separator_", "range", "outrange"], menu_labels: ["Equal To", "Not Equal To", "------------", "Greater Than", "Greater Than or Equal To", "Less Than", "Less Than or Equal To", "------------", "Inside Range", "Outside Range"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "lbracket#", label: "Left Bracket", num_components: 1, default_value: ["ex"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ex", "in"], menu_labels: ["(", "["], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ comparison# != range comparison# != outrange }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "rbracket#", label: "Right Bracket", num_components: 1, default_value: ["ex"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ex", "in"], menu_labels: [")", "]"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ comparison# != range comparison# != outrange }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "range#", label: "Element Range", num_components: 2, default_value: [0, 10], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.MinMax, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ comparison# != range comparison# != outrange }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "expectednum#", label: "Element Count", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ comparison# == range } { comparison# == outrange }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"export_disable": "1", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "severity#", label: "Warning Severity", menu_items: ["message", "warn", "error"], menu_labels: ["Message", "Warning", "Error"], default_value: 2, default_expression: "error", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Pipeline/Data Processing/labs::validate_geometry_type::1.0',_hnt_SOP_labs__validate_geometry_type__1_0)
    return _hnt_SOP_labs__validate_geometry_type__1_0
}
        