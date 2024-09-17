
export default function (hou) {
    class _hnt_VOP_hvectovec extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/hvectovec';
        static category = '/VOP';
        static houdiniType = 'hvectovec';
        static title = 'Vector4 to Vector';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_hvectovec.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "hvec", label: "Input Vector4", num_components: 4, default_value: [0, 0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/hvectovec',_hnt_VOP_hvectovec)
    return _hnt_VOP_hvectovec
}
        