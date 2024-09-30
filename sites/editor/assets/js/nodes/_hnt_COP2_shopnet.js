
export default function (hou) {
    class _hnt_COP2_shopnet extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = true;
        static id = 'COP2/Other/shopnet';
        static category = '/COP2';
        static houdiniType = 'shopnet';
        static title = 'SHOP Network';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_shopnet.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = [];

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
    hou.registerType('COP2/Other/shopnet',_hnt_COP2_shopnet)
    return _hnt_COP2_shopnet
}
        