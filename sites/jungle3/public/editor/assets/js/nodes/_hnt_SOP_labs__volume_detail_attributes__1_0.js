
export default function (hou) {
    class _hnt_SOP_labs__volume_detail_attributes__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Simulation & FX/Pyro/labs::volume_detail_attributes::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::volume_detail_attributes::1.0';
        static title = 'Labs Volume Detail Attributes';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__volume_detail_attributes__1_0.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "vismode", label: "Visualization Mode", menu_items: ["0", "1", "2"], menu_labels: ["No Change", "Normals", "Motion Vectors"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Simulation & FX/Pyro/labs::volume_detail_attributes::1.0',_hnt_SOP_labs__volume_detail_attributes__1_0)
    return _hnt_SOP_labs__volume_detail_attributes__1_0
}
        