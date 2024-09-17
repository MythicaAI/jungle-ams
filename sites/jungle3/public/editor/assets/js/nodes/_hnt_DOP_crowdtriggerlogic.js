
export default function (hou) {
    class _hnt_DOP_crowdtriggerlogic extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/Crowds/crowdtriggerlogic';
        static category = '/DOP';
        static houdiniType = 'crowdtriggerlogic';
        static title = 'Crowd Trigger Logic';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_crowdtriggerlogic.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "operation", label: "Operation", menu_items: ["AND", "OR", "NOT1", "NOT2", "XOR", "NAND", "NOR"], menu_labels: ["AND", "OR", "NOT input 1", "NOT input2", "XOR", "NAND", "NOR"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Crowds/crowdtriggerlogic',_hnt_DOP_crowdtriggerlogic)
    return _hnt_DOP_crowdtriggerlogic
}
        