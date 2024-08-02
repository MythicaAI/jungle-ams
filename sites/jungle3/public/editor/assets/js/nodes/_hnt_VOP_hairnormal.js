
export default function (hou) {
    class _hnt_VOP_hairnormal extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/hairnormal';
        static category = '/VOP';
        static houdiniType = 'hairnormal';
        static title = 'Hair Normal';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "bow", label: "Do Rounding", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/hairnormal',_hnt_VOP_hairnormal)
    return _hnt_VOP_hairnormal
}
        