
export default function (hou) {
    class _hnt_TOP_remotepdgnode extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin, hou._MultiInputMixin) {
        static is_root = false;
        static id = 'TOP/Other/remotepdgnode';
        static category = '/TOP';
        static houdiniType = 'remotepdgnode';
        static title = 'Remote PDG Node';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['TOP'];
            const outputs = ['TOP'];

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
    hou.registerType('TOP/Other/remotepdgnode',_hnt_TOP_remotepdgnode)
    return _hnt_TOP_remotepdgnode
}
        