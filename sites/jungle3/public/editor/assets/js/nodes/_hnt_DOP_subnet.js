
export default function (hou) {
    class _hnt_DOP_subnet extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/Other/subnet';
        static category = '/DOP';
        static houdiniType = 'subnet';
        static title = 'Subnetwork';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_subnet.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP', 'DOP', 'DOP', 'DOP'];
            const outputs = ['DOP', 'DOP', 'DOP', 'DOP'];

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
    hou.registerType('DOP/Other/subnet',_hnt_DOP_subnet)
    return _hnt_DOP_subnet
}
        