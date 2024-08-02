
export default function (hou) {
    class _hnt_SOP_kinefx__poseweightinterp extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/kinefx::poseweightinterp';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::poseweightinterp';
        static title = 'Pose Weight Interpolation';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__poseweightinterp.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "poseweightattrib", label: "Pose Weight Attribute", num_components: 1, default_value: ["pw"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "smoothingmode", label: "Smoothing Mode", menu_items: ["taubin", "qp", "ss", "stashed", "rbf"], menu_labels: ["PWI - Taubin", "PWI - Quadratic Program", "PWI - Sparse Solve", "PWI - Stashed Weights", "RBF - Standard"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "rbfparms", label: "RBF Parmameters", column_labels: [""]});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "clampinput", label: "Clamp Input", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "kerneltype", label: "Kernel Type", menu_items: ["thinplate", "biharmonic", "cauchy", "gaussian", "multiquad", "inversemultiquad", "expbump"], menu_labels: ["Thinplate", "Biharmonic", "Cauchy", "Gaussian", "Multiquadratic", "Inverse Multiquadratic", "Exponential Bump"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "hyperplane", label: "Enable Hyperplane", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "maxhyperplane", label: "Maximize Hyperplane", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "exponent", label: "Exponent", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "falloff", label: "Falloff", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf } { usefalloffattrib == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usefalloffattrib", label: "Falloff From Attribute", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "falloffattrib", label: "Falloff Attribute", num_components: 1, default_value: ["falloff"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf } { usefalloffattrib == 0 }");
			hou_parm_template.setTags({"sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "positiveweights", label: "Enforce Positive Weights", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "damping", label: "Damping", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "interpparms", label: "PWI Parameters", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "stash", label: "Stash Weights", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode == rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "interpmode", label: "Interpolation Mode", menu_items: ["inverseweight", "nlinear", "nspline"], menu_labels: ["Inverse Weight", "N-Linear", "N-Spline"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode == rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "distancepow", label: "Distance Power", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ interpmode != inverseweight } { smoothingmode == rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "resolution", label: "Grid Resolution", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode == rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "passbandfreq", label: "Pass Band Frequency", num_components: 1, default_value: [5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != taubin }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "laplacianconstraints", label: "Laplacian Constraints", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode == taubin } { smoothingmode == rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "boxconstraints", label: "Box Constraints", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode != qp }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "secondorder", label: "Second Order Smoothing", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ smoothingmode == rbf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm3"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "solverparms", label: "Solver Parameters", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numiterations", label: "Number of Iterations", num_components: 1, default_value: [100], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usecoordattrib", label: "Coordinates From Attribute", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "coordattrib", label: "Coordinate Attribute", num_components: 1, default_value: ["pwi_coords"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usecoordattrib == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "ncoords", label: "Pose Space Coordinates", folder_type: hou.folderType.MultiparmBlock, default_value: 2, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usecoordattrib == 1 }");
			hou_parm_template.setTags({"multistartoffset": "0"});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "coord#", label: "coord#", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/kinefx::poseweightinterp',_hnt_SOP_kinefx__poseweightinterp)
    return _hnt_SOP_kinefx__poseweightinterp
}
        