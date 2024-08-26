
export default function (hou) {
    class _hnt_VOP_fuzzyor extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'VOP/Other/fuzzyor';
        static category = '/VOP';
        static houdiniType = 'fuzzyor';
        static title = 'Fuzzy Or';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_fuzzyor.svg';
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
    hou.registerType('VOP/Other/fuzzyor',_hnt_VOP_fuzzyor)
    return _hnt_VOP_fuzzyor
}
        