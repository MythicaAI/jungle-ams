
export default function (hou) {
    class _hnt_VOP_mtlxartistic_ior extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Pbr/mtlxartistic_ior';
        static category = '/VOP';
        static houdiniType = 'mtlxartistic_ior';
        static title = 'MtlX Artistic Ior';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_mtlxartistic_ior.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "reflectivity", label: "Reflectivity", num_components: 3, default_value: [0.944, 0.776, 0.373], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "edge_color", label: "Edge_Color", num_components: 3, default_value: [0.998, 0.981, 0.751], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Pbr/mtlxartistic_ior',_hnt_VOP_mtlxartistic_ior)
    return _hnt_VOP_mtlxartistic_ior
}
        