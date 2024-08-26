
export default function (hou) {
    class _hnt_VOP_hmatxtohvec extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/hmatxtohvec';
        static category = '/VOP';
        static houdiniType = 'hmatxtohvec';
        static title = 'Matrix to Vector4';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

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
    hou.registerType('VOP/Other/hmatxtohvec',_hnt_VOP_hmatxtohvec)
    return _hnt_VOP_hmatxtohvec
}
        