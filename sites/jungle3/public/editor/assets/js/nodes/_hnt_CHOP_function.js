
export default function (hou) {
    class _hnt_CHOP_function extends hou._HoudiniBase {
        static is_root = false;
        static id = 'CHOP/Other/function';
        static category = '/CHOP';
        static houdiniType = 'function';
        static title = 'Function';
        static icon = '/editor/assets/imgs/nodes/_hnt_CHOP_function.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['CHOP', 'CHOP'];
            const outputs = ['CHOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Function", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "func", label: "Function", menu_items: ["sqrt", "abs", "sign", "cos", "sin", "tan", "acos", "asin", "atan", "atan2", "cosh", "sinh", "tanh", "log", "logb", "ln", "pow10", "exp", "powe", "powb", "pow"], menu_labels: ["sqrt(x)         Square Root", "abs(x)         Absolute Value", "sign(x)         Sign", "cos(x)         Cosine", "sin(x)          Sine", "tan(x)         Tangent", "acos(x)       Arccosine", "asin(x)        Arcsine", "atan(x)        Arctan( Input1 )", "atan2(x,y)   Arctan( Input1 / Input2 )", "cosh(x)       Hyperbolic Cosine", "sinh(x)        Hyperbolic Sine", "tanh(x)        Hyperbolic Tangent", "log10(x)       Log base 10", "logN(x)         Log base N", "ln(x)            Natural Log", "pow(10,x)    10 ^ Input1", "exp(x)          e ^ Input1", "pow(x)         Base ^ Input1", "pow(x)         Input1 ^ Exponent", "pow(x,y)      Input1 ^ Input2"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "baseval", label: "Base Value", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "expval", label: "Exponent Value", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "angunit", label: "Angle Units", menu_items: ["deg", "rad", "cycle"], menu_labels: ["Degrees", "Radians", "Cycles"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "match", label: "Match By", menu_items: ["index", "name"], menu_labels: ["Channel Number", "Channel Name"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "matchfailure", label: "Match Failure", menu_items: ["error", "warning", "ignore"], menu_labels: ["Error", "Warning", "Ignore"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_1", label: "Error", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.MenuParmTemplate({name: "error", label: "Error Handling", menu_items: ["abort", "replace", "useprev"], menu_labels: ["Abort With Error Message", "Replace With Specified Values", "Use The Previous Value"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "pinfval", label: "+ Infinity Value", num_components: 1, default_value: [100000000.0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "ninfval", label: "- Infinity Value", num_components: 1, default_value: [null], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "domval", label: "Domain Error Value", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "divval", label: "Divide Error Value", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_2", label: "Common", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "scope", label: "Scope", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "srselect", label: "Sample Rate Match", menu_items: ["first", "max", "min", "err"], menu_labels: ["Resample At First Input's Rate", "Resample At Maximum Rate", "Resample At Minimum Rate", "Error If Rates Differ"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "units", label: "Units", menu_items: ["frames", "samples", "seconds"], menu_labels: ["Frames", "Samples", "Seconds"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "timeslice", label: "Time Slice", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "unload", label: "Unload", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "export", label: "Export Prefix", num_components: 1, default_value: ["../.."], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "gcolor", label: "Graph Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setTags({"varying_default": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "gcolorstep", label: "Graph Color Step", num_components: 1, default_value: [0.05], min: 0, max: 0.2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('CHOP/Other/function',_hnt_CHOP_function)
    return _hnt_CHOP_function
}
        