
export default function (hou) {
    class _hnt_VOP_m3tom4 extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/m3tom4';
        static category = '/VOP';
        static houdiniType = 'm3tom4';
        static title = 'Matrix3 to Matrix4';
        static icon = 'None';
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
    hou.registerType('VOP/Other/m3tom4',_hnt_VOP_m3tom4)
    return _hnt_VOP_m3tom4
}
        