
export default function (hou) {
    class _hnt_VOP_pxrfractal extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrfractal';
        static category = '/VOP';
        static houdiniType = 'pxrfractal';
        static title = 'Pxr Fractal';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrfractal.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
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
			hou_parm_template = new hou.IntParmTemplate({name: "layers", label: "Layers", num_components: 1, default_value: [6], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The number of noise layers used. More layers add successively more noise.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "frequency", label: "Frequency", num_components: 1, default_value: [1], min: 0.1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Sets the lowest (starting) frequency of the noise layers.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "lacunarity", label: "Lacunarity", num_components: 1, default_value: [2], min: 1.25, max: 4, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The scaler used to determine the frequency of each sucessive layer of noise. Smaller numbers will cause the layers to be more closely spaced in frequency. Larger values will space them further apart.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dimension", label: "Dimension", num_components: 1, default_value: [1], min: 0, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The frequency exponent. This value is used to scale the magnitude of each sucessive layer of noise using the formula 1/f^(3-2*Dimension); where f is the frequency of the noise being used for a given layer. It's called Dimension since this value relates to the fractal dimension. Bigger values are rougher, smaller values are smoother.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "erosion", label: "Erosion", num_components: 1, default_value: [0], min: null, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The frequency exponent range. The frequency exponent specified by the Dimension is itself offset as a function of the noise magnitude. This value adjusts that offset. This determines the so-called crossover scale of the fractal. 0 gives a uniform appearance. Negative values will smooth out the low valued areas, and positive values will smooth the high valued ones.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "variation", label: "Variation", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("This value controls which particular variation of the appearance you get - without altering the qualities of the appearance determined by the other controls. So, for example, you can use this to animate the appearance by connecting this to Time, or create several unique instances of the appearance by setting this to different values.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "turbulent", label: "Turbulent", default_value: false});
			hou_parm_template.setHelp("Switch to a turbulent-like pattern");
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
    hou.registerType('VOP/Other/pxrfractal',_hnt_VOP_pxrfractal)
    return _hnt_VOP_pxrfractal
}
        