
export default function (hou) {
    class _hnt_VOP_splatter extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/splatter';
        static category = '/VOP';
        static houdiniType = 'splatter';
        static title = 'Splatter';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_splatter.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "mainfreq", label: "Primary Frequency", num_components: 1, default_value: [4], min: 1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "secfreq", label: "Secondary Frequency", num_components: 1, default_value: [2], min: 1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "thresh", label: "Threshold", num_components: 1, default_value: [0.65], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "niter", label: "Iterations", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "filter", label: "Filter Type", num_components: 1, default_value: ["box"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["box", "gauss", "bartlett", "sinc", "hanning", "blackman", "catrom", "mitchell", "gaussian", "disk", "radial-bspline"], menu_labels: ["Box", "VEX: Gaussian", "VEX: Bartlett/Triangular", "VEX: Sinc Sharpening", "VEX: Hanning", "VEX: Blackman", "VEX: Catmull-Rom", "VEX: Mitchell", "RSL: Gaussian", "RSL: Poisson Disk", "RSL: Radial B-Spline"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/splatter',_hnt_VOP_splatter)
    return _hnt_VOP_splatter
}
        