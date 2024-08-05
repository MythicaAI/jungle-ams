
export default function (hou) {
    class _hnt_VOP_kinefx__parentblend extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/KineFX/kinefx::parentblend';
        static category = '/VOP/kinefx';
        static houdiniType = 'kinefx::parentblend';
        static title = 'Parent Blend';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_kinefx__parentblend.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "components", label: "Components", menu_items: ["t", "r", "s"], menu_labels: ["Translate", "Rotate", "Scale"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "blend", label: "Blend", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/KineFX/kinefx::parentblend',_hnt_VOP_kinefx__parentblend)
    return _hnt_VOP_kinefx__parentblend
}
        