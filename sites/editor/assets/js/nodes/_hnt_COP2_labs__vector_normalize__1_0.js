
export default function (hou) {
    class _hnt_COP2_labs__vector_normalize__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'COP2/Labs/Image/Vector/labs::vector_normalize::1.0';
        static category = '/COP2/labs';
        static houdiniType = 'labs::vector_normalize::1.0';
        static title = 'Labs Vector Normalize';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_labs__vector_normalize__1_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2', 'COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "enable", label: "Enable", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "max", label: "Max", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The maximun value inorder to rescale the range.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "min", label: "Min", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The minimun value inorder to rescale the range.");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Labs/Image/Vector/labs::vector_normalize::1.0',_hnt_COP2_labs__vector_normalize__1_0)
    return _hnt_COP2_labs__vector_normalize__1_0
}
        