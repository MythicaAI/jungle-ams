
export default function (hou) {
    class _hnt_VOP_matx2tofloat extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/matx2tofloat';
        static category = '/VOP';
        static houdiniType = 'matx2tofloat';
        static title = 'Matrix2 to Float';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "matx2", label: "Input Matrix", num_components: 4, default_value: [1, 0, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/matx2tofloat',_hnt_VOP_matx2tofloat)
    return _hnt_VOP_matx2tofloat
}
        