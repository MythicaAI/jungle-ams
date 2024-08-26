
export default function (hou) {
    class _hnt_DOP_crowdtriggerlogic__2_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/Crowds/crowdtriggerlogic::2.0';
        static category = '/DOP';
        static houdiniType = 'crowdtriggerlogic::2.0';
        static title = 'Crowd Trigger Logic';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_crowdtriggerlogic__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP', 'DOP'];
            const outputs = ['DOP', 'DOP', 'DOP', 'DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "operation", label: "Operation", menu_items: ["AND", "OR", "NOT1", "NOT2", "XOR", "NAND", "NOR"], menu_labels: ["AND", "OR", "NOT Input 1", "NOT Input 2", "XOR", "NAND", "NOR"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "triggerattrib", label: "Trigger Attribute", num_components: 1, default_value: ["crowdtriggerlogic_$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Crowds/crowdtriggerlogic::2.0',_hnt_DOP_crowdtriggerlogic__2_0)
    return _hnt_DOP_crowdtriggerlogic__2_0
}
        