
export default function (hou) {
    class _hnt_LOP_subnet extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Other/subnet';
        static category = '/LOP';
        static houdiniType = 'subnet';
        static title = 'Subnetwork';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_subnet.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP', 'LOP', 'LOP', 'LOP'];
            const outputs = ['LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP'];

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
    hou.registerType('LOP/Other/subnet',_hnt_LOP_subnet)
    return _hnt_LOP_subnet
}
        