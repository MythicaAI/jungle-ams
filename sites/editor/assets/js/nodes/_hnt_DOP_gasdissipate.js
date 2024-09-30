
export default function (hou) {
    class _hnt_DOP_gasdissipate extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/Other/gasdissipate';
        static category = '/DOP';
        static houdiniType = 'gasdissipate';
        static title = 'Gas Dissipate';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_gasdissipate.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "field", label: "Field", num_components: 1, default_value: ["density"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "stencilfield", label: "Stencil Field", num_components: 1, default_value: ["active"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "controlfield", label: "Control Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["heat", "temperature"], menu_labels: ["Heat (age)", "Temperature"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "diffusion", label: "Diffusion", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "evaporation", label: "Evaporation Rate", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "subtractovertime", label: "Evaporate by Subtraction", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "subtractrate", label: "Subtraction Rate", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ subtractovertime == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "mapevaporation", label: "Scale Evaporation Rate by Control", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "mapcontroltoevaporation", label: "Map Control to Evaporation Scale", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ mapevaporation == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "rampbasis_var": "mapcontroltoevaporation_the_basis_strings", "rampbasisdefault": "catmull-rom", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( catmull-rom ) 2pos ( 1 ) 2value ( 1 ) 2interp ( catmull-rom )", "rampkeys_var": "mapcontroltoevaporation_the_key_positions", "rampshowcontrolsdefault": "0", "rampvalues_var": "mapcontroltoevaporation_the_key_values"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dominclamp", label: "Clamp to Minimum", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "minimum", label: "Minimum", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dominclamp == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "domaxclamp", label: "Clamp to Maximum", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "maximum", label: "Maximum", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ domaxclamp == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "mapcontroltomax", label: "Map Control to Maximum", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ domaxclamp == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "rampbasis_var": "mapcontroltomax_the_basis_strings", "rampbasisdefault": "catmull-rom", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( catmull-rom ) 2pos ( 1 ) 2value ( 0 ) 2interp ( catmull-rom )", "rampkeys_var": "mapcontroltomax_the_key_positions", "rampshowcontrolsdefault": "0", "rampvalues_var": "mapcontroltomax_the_key_values"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "mapcontroltosubtractrate", label: "Map Control to Subtraction Rate Scale", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ subtractovertime == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "rampbasis_var": "mapcontroltosubtractrate_the_basis_strings", "rampbasisdefault": "catmull-rom", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( catmull-rom ) 2pos ( 1 ) 2value ( 1 ) 2interp ( catmull-rom )", "rampkeys_var": "mapcontroltosubtractrate_the_key_positions", "rampshowcontrolsdefault": "0", "rampvalues_var": "mapcontroltosubtractrate_the_key_values"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "remapcontrol", label: "Remap Control Field", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "controlmin", label: "Control Min", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ remapcontrol == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "controlmax", label: "Control Max", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ remapcontrol == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Other/gasdissipate',_hnt_DOP_gasdissipate)
    return _hnt_DOP_gasdissipate
}
        