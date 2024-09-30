
export default function (hou) {
    class _hnt_VOP_lens_chromaticaberration extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/lens_chromaticaberration';
        static category = '/VOP';
        static houdiniType = 'lens_chromaticaberration';
        static title = 'Lens Chromatic Aberration';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_lens_chromaticaberration.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "aberration", label: "Amount of Aberration", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "aramp", label: "Aberration Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setTags({"rampbasis_var": "aramp_basis", "rampfloatdefault": "1pos ( 0 ) 1interp ( linear ) 1value ( 1 ) 2pos ( 1 ) 2interp ( linear ) 2value ( 0 )", "rampkeys_var": "aramp_positions", "rampvalues_var": "aramp_values"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/lens_chromaticaberration',_hnt_VOP_lens_chromaticaberration)
    return _hnt_VOP_lens_chromaticaberration
}
        