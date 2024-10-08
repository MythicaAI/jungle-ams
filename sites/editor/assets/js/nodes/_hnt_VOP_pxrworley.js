
export default function (hou) {
    class _hnt_VOP_pxrworley extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrworley';
        static category = '/VOP';
        static houdiniType = 'pxrworley';
        static title = 'Pxr Worley';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrworley.svg';
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
			hou_parm_template = new hou.FloatParmTemplate({name: "frequency", label: "Frequency", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the size of the cells. Higher frequencies make smaller cells.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "distancemetric", label: "Distance Metric", menu_items: ["0", "1", "2", "3", "4"], menu_labels: ["Euclidian", "Euclidian Squared", "Manhattan", "Chebyshev", "Minkowski"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("The means to measure distances to neighboring cells. Manhattan distance gives more rectangular shapes and Euclidian distance gives more spherical shapes.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "jitter", label: "Jitter", num_components: 1, default_value: [0.75], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the distortion of the cells.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "c1", label: "C1", num_components: 1, default_value: [0.8], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Multiplier for the distances to the first feature.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "c2", label: "C2", num_components: 1, default_value: [null], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Multiplier for the distance to the second feature.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "minkowskiExponent", label: "Minkowski Exponent", num_components: 1, default_value: [4], min: 0.5, max: 20, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Makes the distance transition smoothly from Euclidean to Manhattan.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "shape", label: "Shape", menu_items: ["0", "1", "2"], menu_labels: ["Linear", "Thin", "Fat"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Modifies the computed distances to create different shapes (Linear or Cosine).");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "clamp", label: "Clamp", default_value: true});
			hou_parm_template.setHelp("Causes resulting distances to be clamped to the range 0 to 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invert", label: "Invert", default_value: false});
			hou_parm_template.setHelp("Inverts the final pattern.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "randomScale", label: "Random Scale", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Randomize the amplitude of the cells.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "randomScaleCenter", label: "Random Scale Center", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Randomize the amplitude of the cells.");
			hou_parm_template.setTags({"script_ritype": "float"});
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
    hou.registerType('VOP/Other/pxrworley',_hnt_VOP_pxrworley)
    return _hnt_VOP_pxrworley
}
        