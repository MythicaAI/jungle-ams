
export default function (hou) {
    class _hnt_SOP_kinefx__characterpack extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Animation/Character/kinefx::characterpack';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::characterpack';
        static title = 'Character Pack';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__characterpack.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
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
    hou.registerType('SOP/Animation/Character/kinefx::characterpack',_hnt_SOP_kinefx__characterpack)
    return _hnt_SOP_kinefx__characterpack
}
        