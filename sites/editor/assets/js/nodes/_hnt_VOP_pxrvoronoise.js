
export default function (hou) {
    class _hnt_VOP_pxrvoronoise extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrvoronoise';
        static category = '/VOP';
        static houdiniType = 'pxrvoronoise';
        static title = 'Pxr Voronoise';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrvoronoise.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "surfacePosition", label: "Surface Position", menu_items: ["0", "1"], menu_labels: ["Current Position", "Un-Displaced Position"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("If you want your displacement pattern to match surface shading, use the undisplaced position. This is only active when there is no connected manifold.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "frequency", label: "Frequency", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Sets the lowest (starting) frequency of the noise layers.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "octaves", label: "Octaves", num_components: 1, default_value: [3], min: 1, max: 6, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The number of noise octaves used. More octaves add successively more noise.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "gain", label: "Gain", num_components: 1, default_value: [0.5], min: 0.001, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Also known as persistence. Used to shrink or expand the amplitude of each successive octave of noise. 1/f noise is achieved when gain = 1/lacunarity");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "lacunarity", label: "Lacunarity", num_components: 1, default_value: [2], min: 0, max: 8, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The scaler used to determine the frequency of each sucessive octave of noise. Smaller numbers will cause the layers to be more closely spaced in frequency. Larger values will space them further apart.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "jitter", label: "Jitter", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the amount of jitter applied. 0 gives regular grid, 1 gives a Voronoi like grid");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "smoothness", label: "Smoothness", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("0 produces a voronoi/cellnoise pattern, 1 results in smooth noise.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "turbulent", label: "Turbulent", default_value: false});
			hou_parm_template.setHelp("Should the noise be turbulent");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "manifold", label: "Manifold", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("The manifold over which to apply the noise. (The default is P).");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrvoronoise',_hnt_VOP_pxrvoronoise)
    return _hnt_VOP_pxrvoronoise
}
        