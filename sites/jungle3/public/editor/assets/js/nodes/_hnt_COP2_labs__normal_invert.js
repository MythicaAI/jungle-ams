
export default function (hou) {
    class _hnt_COP2_labs__normal_invert extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'COP2/Labs/Image/Vector/labs::normal_invert';
        static category = '/COP2/labs';
        static houdiniType = 'labs::normal_invert';
        static title = 'Labs Normal Invert';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_labs__normal_invert.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "invert_x", label: "Invert X", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invert_y", label: "Invert Y", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invert_z", label: "Invert Z", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Labs/Image/Vector/labs::normal_invert',_hnt_COP2_labs__normal_invert)
    return _hnt_COP2_labs__normal_invert
}
        