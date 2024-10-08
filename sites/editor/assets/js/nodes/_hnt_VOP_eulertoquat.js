
export default function (hou) {
    class _hnt_VOP_eulertoquat extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/eulertoquat';
        static category = '/VOP';
        static houdiniType = 'eulertoquat';
        static title = 'Euler to Quaternion';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_eulertoquat.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "xyz", label: "Rotation Order", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["xyz", "xzy", "yxz", "yzx", "zxy", "zyx"], menu_labels: ["Rx Ry Rz", "Rx Rz Ry", "Ry Rx Rz", "Ry Rz Rx", "Rz Rx Ry", "Rz Ry Rx"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "rot", label: "Rotate (Degrees)", num_components: 3, default_value: [0, 0, 0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/eulertoquat',_hnt_VOP_eulertoquat)
    return _hnt_VOP_eulertoquat
}
        