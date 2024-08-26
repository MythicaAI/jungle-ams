
export default function (hou) {
    class _hnt_DRIVER_subnet extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DRIVER/Other/subnet';
        static category = '/DRIVER';
        static houdiniType = 'subnet';
        static title = 'Subnetwork';
        static icon = '/editor/assets/imgs/nodes/_hnt_DRIVER_subnet.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER', 'DRIVER'];
            const outputs = ['DRIVER'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "execute", label: "Render"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "renderdialog", label: "Controls..."});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DRIVER/Other/subnet',_hnt_DRIVER_subnet)
    return _hnt_DRIVER_subnet
}
        