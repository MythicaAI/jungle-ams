
export default function (hou) {
    class _hnt_VOP_hmtlxcheckers2d extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Procedural2D/hmtlxcheckers2d';
        static category = '/VOP';
        static houdiniType = 'hmtlxcheckers2d';
        static title = 'MtlX Checkers2D';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_hmtlxcheckers2d.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "freq", label: "Frequency", num_components: 2, default_value: [8, 8], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "offset", label: "Offset", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "texcoord", label: "Texture Coordinates", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Procedural2D/hmtlxcheckers2d',_hnt_VOP_hmtlxcheckers2d)
    return _hnt_VOP_hmtlxcheckers2d
}
        