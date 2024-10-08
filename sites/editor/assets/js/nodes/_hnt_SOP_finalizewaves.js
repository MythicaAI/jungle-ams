
export default function (hou) {
    class _hnt_SOP_finalizewaves extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Other/finalizewaves';
        static category = '/SOP';
        static houdiniType = 'finalizewaves';
        static title = 'Finalize Waves';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_finalizewaves.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

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
    hou.registerType('SOP/Other/finalizewaves',_hnt_SOP_finalizewaves)
    return _hnt_SOP_finalizewaves
}
        