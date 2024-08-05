
export default function (hou) {
    class _hnt_VOP_floattoint extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/floattoint';
        static category = '/VOP';
        static houdiniType = 'floattoint';
        static title = 'Float to Integer';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_floattoint.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "fval", label: "Float Input", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/floattoint',_hnt_VOP_floattoint)
    return _hnt_VOP_floattoint
}
        