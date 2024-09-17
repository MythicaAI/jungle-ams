
export default function (hou) {
    class _hnt_DOP_crowdfuzzylogic extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/Crowds/crowdfuzzylogic';
        static category = '/DOP';
        static houdiniType = 'crowdfuzzylogic';
        static title = 'Crowd Fuzzy Logic';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_crowdfuzzylogic.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP', 'DOP', 'DOP', 'DOP', 'DOP', 'DOP', 'DOP', 'DOP', 'DOP', 'DOP'];
            const outputs = ['DOP', 'DOP', 'DOP', 'DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "outputtype", label: "Output", menu_items: ["0", "1"], menu_labels: ["Boolean", "Crisp"], default_value: 0, default_expression: "boolean", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "booleanthreshold", label: "Boolean Threshold", num_components: 1, default_value: [0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ outputtype == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "thresholdtest", label: "Test", num_components: 1, default_value: ["lt"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["eq", "lt", "gt", "lte", "gte", "neq"], menu_labels: ["Equal\t(==)", "Less Than\t(<)", "Greater Than\t(>)", "Less Than Or Equal\t(<=)", "Greater Than Or Equal\t(>=)", "Not Equal\t(!=)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ outputtype == 1 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "triggerattrib", label: "Trigger Attribute", num_components: 1, default_value: ["crowdfuzzylogic_`$OS`_`ifs(ch(\"outputtype\") == 1, \"crispoutput\", \"booleanoutput\")"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Crowds/crowdfuzzylogic',_hnt_DOP_crowdfuzzylogic)
    return _hnt_DOP_crowdfuzzylogic
}
        