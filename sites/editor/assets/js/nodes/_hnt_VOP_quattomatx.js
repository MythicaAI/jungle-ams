
export default function (hou) {
    class _hnt_VOP_quattomatx extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/quattomatx';
        static category = '/VOP';
        static houdiniType = 'quattomatx';
        static title = 'Quaternion to Matrix3';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_quattomatx.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
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
    hou.registerType('VOP/Other/quattomatx',_hnt_VOP_quattomatx)
    return _hnt_VOP_quattomatx
}
        