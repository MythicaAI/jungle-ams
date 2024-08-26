
export default function (hou) {
    class _hnt_DOP_gascurveforce extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/Micro Solvers/gascurveforce';
        static category = '/DOP';
        static houdiniType = 'gascurveforce';
        static title = 'Gas Curve Force';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_gascurveforce.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['DOP', 'DOP', 'DOP', 'DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "activate", label: "Activation", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "divsize", label: "Force Division Size", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "units": "m1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "Curve_Force", label: "Curve Force", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "soppath", label: "Geometry Source", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"opfilter": "!!SOP!!", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "scaleglobal", label: "Global Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "maxradius", label: "Max Influence Radius", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "use_wind", label: "Treat as wind", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "script_callback_language": "python", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "air_resist", label: "Air Resistance", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_wind == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "script_callback": "", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "Individual_Forces", label: "Individual Forces", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "scalefollow", label: "Follow Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scalesuction", label: "Suction Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scaleorbit", label: "Orbit Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scaleincomingvel", label: "Inherit Velocity Scale", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "Force_Falloffs", label: "Follow Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template4 = new hou.RampParmTemplate({name: "followramp", label: "Follow Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "followramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0.63333332538604736 ) 1interp ( linear ) 2pos ( 0.31638416647911072 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 1 ) 3value ( 0 ) 3interp ( linear )", "rampkeys_var": "followramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "followramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "Force_Falloffs_1", label: "Suction Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template4 = new hou.RampParmTemplate({name: "suctionramp", label: "Suction Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "suctionramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampkeys_var": "suctionramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "suctionramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "Force_Falloffs_2", label: "Orbit Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template4 = new hou.RampParmTemplate({name: "orbitramp", label: "Orbit Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "orbitramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 0.13747645914554596 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 1 ) 3value ( 0 ) 3interp ( linear )", "rampkeys_var": "orbitramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "orbitramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "Force_Falloffs_3", label: "Velocity Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template4 = new hou.RampParmTemplate({name: "calc_velocity_rampvel", label: "Incoming Velocity Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "rampvel_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 0 ) 2interp ( linear )", "rampkeys_var": "rampvel_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "rampvel_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "Individual_Forces_1", label: "Global Forces", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.RampParmTemplate({name: "forcefalloff", label: "Global Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 1, default_basis: null, color_type: null});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "forcefalloff_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 1 ) 1value ( 1 ) 1interp ( linear )", "rampkeys_var": "forcefalloff_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "forcefalloff_the_key_values", "script_callback": "", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "lengthfalloff", label: "Force Along Length", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "lengthfalloff_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 0.9090038537979126 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 1 ) 3value ( 0 ) 3interp ( linear )", "rampkeys_var": "lengthfalloff_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "lengthfalloff_the_key_values", "script_callback": "", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "Individual_Forces_2", label: "Shaping", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "resamplecurve", label: "Resample Curve", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "max_seg_length", label: "Max Segment Length", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "robert"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "radiusalonglength", label: "Scale Radius Along Length", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "Curve_Force_1", label: "Guides", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "showguide", label: "Show Guide Geometry", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "guide_traillen", label: "Trail Length", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Micro Solvers/gascurveforce',_hnt_DOP_gascurveforce)
    return _hnt_DOP_gascurveforce
}
        