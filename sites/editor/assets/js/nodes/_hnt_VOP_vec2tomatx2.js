
export default function (hou) {
    class _hnt_VOP_vec2tomatx2 extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/vec2tomatx2';
        static category = '/VOP';
        static houdiniType = 'vec2tomatx2';
        static title = 'Vector2 to Matrix2';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "vval1", label: "Row 1", num_components: 2, default_value: [1, 0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "vval2", label: "Row 2", num_components: 2, default_value: [0, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/vec2tomatx2',_hnt_VOP_vec2tomatx2)
    return _hnt_VOP_vec2tomatx2
}
        