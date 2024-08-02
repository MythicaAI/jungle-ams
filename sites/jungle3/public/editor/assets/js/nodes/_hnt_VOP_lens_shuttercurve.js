
export default function (hou) {
    class _hnt_VOP_lens_shuttercurve extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/lens_shuttercurve';
        static category = '/VOP';
        static houdiniType = 'lens_shuttercurve';
        static title = 'Lens Shutter Curve';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_lens_shuttercurve.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.RampParmTemplate({name: "scurve", label: "Shutter Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setTags({"rampbasis_var": "scurve_basis", "rampfloatdefault": "1pos ( 0 ) 1interp ( linear ) 1value ( 1 ) 2pos ( 1 ) 2interp ( linear ) 2value ( 1 )", "rampkeys_var": "scurve_positions", "rampvalues_var": "scurve_values"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/lens_shuttercurve',_hnt_VOP_lens_shuttercurve)
    return _hnt_VOP_lens_shuttercurve
}
        