
export default function (hou) {
    class _hnt_VOP_qmultiply extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/qmultiply';
        static category = '/VOP';
        static houdiniType = 'qmultiply';
        static title = 'Quaternion Multiply';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_qmultiply.svg';
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
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/qmultiply',_hnt_VOP_qmultiply)
    return _hnt_VOP_qmultiply
}
        