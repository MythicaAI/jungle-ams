
export default function (hou) {
    class _hnt_SOP_packgroom extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Hair and Fur/packgroom';
        static category = '/SOP';
        static houdiniType = 'packgroom';
        static title = 'Groom Pack';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_packgroom.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP'];
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
    hou.registerType('SOP/Character FX/Hair and Fur/packgroom',_hnt_SOP_packgroom)
    return _hnt_SOP_packgroom
}
        