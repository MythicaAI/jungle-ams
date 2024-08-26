
export default function (hou) {
    class _hnt_COPNET_img extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'COPNET/Other/img';
        static category = '/COPNET';
        static houdiniType = 'img';
        static title = 'Image Network';
        static icon = '/editor/assets/imgs/nodes/_hnt_COPNET_img.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['COPNET'];

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
    hou.registerType('COPNET/Other/img',_hnt_COPNET_img)
    return _hnt_COPNET_img
}
        