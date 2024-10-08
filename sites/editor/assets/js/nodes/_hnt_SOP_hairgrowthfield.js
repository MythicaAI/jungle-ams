
export default function (hou) {
    class _hnt_SOP_hairgrowthfield extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Hair and Fur/hairgrowthfield';
        static category = '/SOP';
        static houdiniType = 'hairgrowthfield';
        static title = 'Hair Growth Field';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_hairgrowthfield.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "fastedit", label: "Fast Edit", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "growthfieldquality", label: "Growth Field Quality", num_components: 1, default_value: [0], min: 0.25, max: 4, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "shaping_1", label: "Guides", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "volumes", label: "Volumes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "scalpvoxelsize", label: "Scalp Voxel Size", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "roots", label: "Roots", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "scatter2_group", label: "Scalp Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a scatter2 group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "displayroots", label: "Display Roots Points Only", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "guidespacing", label: "Guide Spacing", num_components: 1, default_value: [0.05], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "guidedensityscale", label: "Density Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "scatterfolder", label: "Density", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			let hou_parm_template4 = new hou.ToggleParmTemplate({name: "forcetotal", label: " ", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template4.setTags({"autoscope": "0000000000000000"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "npts", label: "Force Total Count", num_components: 1, default_value: [1000], min: 1, max: 100000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ forcetotal == 0 }");
			hou_parm_template4.setTags({"autoscope": "0000000000000000"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "usedensityattrib", label: " ", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template4.setTags({"autoscope": "0000000000000000"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "densityattrib", label: "Density Attribute", num_components: 1, default_value: ["density"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a scatter2 densityattrib", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "export_disable": "1"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "useemergencylimit", label: " ", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ forcetotal == 1 }");
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template4.setTags({"autoscope": "0000000000000000"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "emergencylimit", label: "Emergency Limit", num_components: 1, default_value: [1000000], min: 1000, max: 10000000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ forcetotal == 1 }");
			hou_parm_template4.setTags({"autoscope": "0000000000000000"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "relaxiterations", label: "Relax Iterations", num_components: 1, default_value: [10], min: 0, max: 100, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setTags({"autoscope": "0000000000000000"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "guiderootpercent", label: "Percentage Of Guide to Use as Root", num_components: 1, default_value: [1.4], min: 0, max: 100, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ switchroottype == 0 }");
			hou_parm_template4.setTags({"autoscope": "0000000000000000"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "shaping", label: "Shaping", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			hou_parm_template3 = new hou.FolderParmTemplate({name: "maskoptions", label: "Mask ", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.FloatParmTemplate({name: "maskinfluence", label: "Mask Influence", num_components: 1, default_value: [1], min: 0.001, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "script_callback": ""});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "strokeinfluence", label: "Stroke Influence", num_components: 1, default_value: [1], min: 0.001, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "script_callback": ""});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "guideradius", label: "Radius Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scalpnormalforce", label: "Scalp Normal Force", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scalpblendwidth", label: "Blend Width", num_components: 1, default_value: [0.1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scalpblendwidthinner", label: "Blend Width", num_components: 1, default_value: [0], default_expression: ["ch(\"scalpblendwidth\")"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "folder0", label: "Guide Shape", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template4 = new hou.FloatParmTemplate({name: "guideshapeeffect", label: "Ramp Effect", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.RampParmTemplate({name: "guideshaperamp", label: "Guide Shape", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "ramp_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 0.67299270629882813 ) 2value ( 0.77083331346511841 ) 2interp ( linear ) 3pos ( 0.8350365161895752 ) 3value ( 0.60416668653488159 ) 3interp ( linear ) 4pos ( 1 ) 4value ( 0 ) 4interp ( linear )", "rampkeys_var": "ramp_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "ramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "advection", label: "Advection", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "guideadvectiontype", label: "Advection Type", num_components: 1, default_value: ["3rd rk"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["fwd euler", "2nd rk", "3rd rk", "4th rk"], menu_labels: ["Forward Euler", "Second-Order Runge-Kutta", "Third-Order Runge-Kutta", "Fourth-Order Runge-Kutta"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "guideadvectionlength", label: "Length", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "guideadvectionsamples", label: "Samples", num_components: 1, default_value: [25], min: 1, max: 50, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "shaping_1_1", label: "Output", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.IntParmTemplate({name: "outputsegs", label: "Segments Per Guide", num_components: 1, default_value: [20], min: 1, max: 50, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "exportvectorfield", label: "Export Groom Field", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback": ""});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "addroot", label: "Add Root Attribute", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "cullguideswitch", label: "Cull Short Guides", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "culllength", label: "Cull Length", num_components: 1, default_value: [0.2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ cullguideswitch == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "addcolor", label: "Add Color To Guides", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "haircolorramp", label: "Hair Color", ramp_parm_type: hou.rampParmType.Color, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ addcolor == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampcolordefault": "1pos ( 0 ) 1c ( 0.019999999552965164 0.019679998978972435 0.019679998978972435 ) 1interp ( linear ) 2pos ( 0.61795604228973389 ) 2c ( 0.39721107482910156 0.39701426029205322 0.39701426029205322 ) 2interp ( linear ) 3pos ( 1 ) 3c ( 1 1 1 ) 3interp ( linear )", "script_callback": ""});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Hair and Fur/hairgrowthfield',_hnt_SOP_hairgrowthfield)
    return _hnt_SOP_hairgrowthfield
}
        