
export default function (hou) {
    class _hnt_CHOPNET_ch extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'CHOPNET/Other/ch';
        static category = '/CHOPNET';
        static houdiniType = 'ch';
        static title = 'CHOP Network';
        static icon = '/editor/assets/imgs/nodes/_hnt_CHOPNET_ch.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['CHOPNET'];

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
    hou.registerType('CHOPNET/Other/ch',_hnt_CHOPNET_ch)
    return _hnt_CHOPNET_ch
}
        