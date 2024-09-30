
export default function (hou) {
    class _hnt_VOP_isfog extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/isfog';
        static category = '/VOP';
        static houdiniType = 'isfog';
        static title = 'Is Fog Ray';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_isfog.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
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
    hou.registerType('VOP/Other/isfog',_hnt_VOP_isfog)
    return _hnt_VOP_isfog
}
        