
export default function (hou) {
    class _hnt_VOP_kinefx__combinelocaltransform extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/KineFX/kinefx::combinelocaltransform';
        static category = '/VOP/kinefx';
        static houdiniType = 'kinefx::combinelocaltransform';
        static title = 'Combine Local Transform';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_kinefx__combinelocaltransform.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/KineFX/kinefx::combinelocaltransform',_hnt_VOP_kinefx__combinelocaltransform)
    return _hnt_VOP_kinefx__combinelocaltransform
}
        