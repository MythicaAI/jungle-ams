
export default function (hou) {
    class _hnt_SOP_labs__procedural_smoke extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/FX/Pyro/labs::procedural_smoke';
        static category = '/SOP/labs';
        static houdiniType = 'labs::procedural_smoke';
        static title = 'Labs Procedural Smoke';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__procedural_smoke.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "size", label: "Size", num_components: 3, default_value: [5, 5, 1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "t", label: "Center", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "particlesep", label: "Point Separation", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "densityboost", label: "Density Boost", num_components: 1, default_value: [3.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "pointpreview", label: "Preview", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_basenoise", label: "Base Noise", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_basenoise1", label: "Base Noise 1", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "pulseduration", label: "Pulse Duration", num_components: 1, default_value: [6], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "elementsize", label: "Element Size", num_components: 1, default_value: [1.2], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "elementscale", label: "Element Scale", num_components: 3, default_value: [1, 1.4, 1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn1horizontalspeed", label: "Horizontal Speed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn1verticalspeed", label: "Vertical Speed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bn1oscillate == 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bn1oscillate", label: "Oscillate", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn1oscillateamplitude", label: "Amplitude", num_components: 1, default_value: [0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bn1oscillate == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn1oscillatespeed", label: "Speed", num_components: 1, default_value: [1.25], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bn1oscillate == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_basenoise2", label: "Base Noise 2", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.FloatParmTemplate({name: "pulseduration2", label: "Pulse Duration", num_components: 1, default_value: [3], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "elementsize2", label: "Element Size", num_components: 1, default_value: [1.2], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "elementscale2", label: "Element Scale", num_components: 3, default_value: [1, 1.4, 1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn2horizontalspeed", label: "Horizontal Speed", num_components: 1, default_value: [1.25], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn2verticalspeed", label: "Vertical Speed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bn2oscillate == 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bn2oscillate", label: "Oscillate", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn2oscillateamplitude", label: "Amplitude", num_components: 1, default_value: [0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bn2oscillate == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bn2oscillatespeed", label: "Speed", num_components: 1, default_value: [1.25], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bn2oscillate == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_basenoise_1", label: "Detail", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "detailenable", label: "Add Detail", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "type", label: "Noise Type", num_components: 1, default_value: ["anoise"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["pnoise", "onoise", "snoise", "anoise", "xnoise", "correctnoise"], menu_labels: ["Perlin Noise", "Original Perlin Noise", "Sparse Convolution Noise", "Alligator Noise", "Simplex Noise", "Zero Centered Perlin Noise"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "freq", label: "Frequency", num_components: 3, default_value: [3, 3, 3], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "amp", label: "Amplitude", num_components: 1, default_value: [1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "rough", label: "Roughness", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "turb", label: "Turbulence", num_components: 1, default_value: [3], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "ramp", label: "ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "ramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 0.10301507264375687 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 0.36432161927223206 ) 3value ( 0 ) 3interp ( linear ) 4pos ( 0.99623113870620728 ) 4value ( 0 ) 4interp ( linear )", "rampkeys_var": "ramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "ramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "horizontalspeed", label: "Horizontal Speed", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "verticalspeed", label: "Vertical Speed", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ oscillate == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "oscillate", label: "Oscillate", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "oscillateamplitude", label: "Oscillate Amplitude", num_components: 1, default_value: [0.35], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ oscillate == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "oscillatespeed", label: "Oscillate Speed", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ oscillate == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_basenoise_2", label: "Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "falloffenable", label: "Enable Falloff", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "x_ramp", label: "x_ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "x_ramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( catmull-rom ) 2pos ( 0.20351758599281311 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 0.80150753259658813 ) 3value ( 1 ) 3interp ( catmull-rom ) 4pos ( 1 ) 4value ( 0 ) 4interp ( linear )", "rampkeys_var": "x_ramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "x_ramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "y_ramp", label: "y_ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "y_ramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( catmull-rom ) 2pos ( 0.19849246740341187 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 0.7964823842048645 ) 3value ( 1 ) 3interp ( catmull-rom ) 4pos ( 1 ) 4value ( 0 ) 4interp ( linear )", "rampkeys_var": "y_ramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "y_ramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "z_ramp", label: "z_ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "z_ramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( catmull-rom ) 2pos ( 0.17964823544025421 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 0.82914572954177856 ) 3value ( 1 ) 3interp ( catmull-rom ) 4pos ( 1 ) 4value ( 0 ) 4interp ( linear )", "rampkeys_var": "z_ramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "z_ramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/FX/Pyro/labs::procedural_smoke',_hnt_SOP_labs__procedural_smoke)
    return _hnt_SOP_labs__procedural_smoke
}
        