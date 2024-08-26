
export default function (hou) {
    class _hnt_DOP_onlyonce extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'DOP/Other/onlyonce';
        static category = '/DOP';
        static houdiniType = 'onlyonce';
        static title = 'Data Only Once';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_onlyonce.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP'];
            const outputs = ['DOP'];

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
    hou.registerType('DOP/Other/onlyonce',_hnt_DOP_onlyonce)
    return _hnt_DOP_onlyonce
}
        