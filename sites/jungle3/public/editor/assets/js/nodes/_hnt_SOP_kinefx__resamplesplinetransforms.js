
export default function (hou) {
    class _hnt_SOP_kinefx__resamplesplinetransforms extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/kinefx::resamplesplinetransforms';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::resamplesplinetransforms';
        static title = 'Resample Spline Transforms';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__resamplesplinetransforms.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "mode", label: "Mode", menu_items: ["secondaryaxis", "slideframe"], menu_labels: ["Secondary Axis", "Slideframe"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "refaxis", label: "Input Reference Axis", menu_items: ["negx", "negy", "negz", "x", "y", "z"], menu_labels: ["-X", "-Y", "-Z", "X", "Y", "Z"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "primaryaxis", label: "Primary Axis", menu_items: ["negx", "negy", "negz", "x", "y", "z"], menu_labels: ["-X", "-Y", "-Z", "X", "Y", "Z"], default_value: 5, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "secondaryaxisx", label: "Secondary Axis", menu_items: ["negy", "negz", "y", "z"], menu_labels: ["-Y", "-Z", "Y", "Z"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ primaryaxis != negx primaryaxis != x }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "secondaryaxisy", label: "Secondary Axis", menu_items: ["negx", "negz", "x", "z"], menu_labels: ["-X", "-Z", "X", "Z"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ primaryaxis != negy primaryaxis != y }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "secondaryaxisz", label: "Secondary Axis", menu_items: ["negx", "negy", "x", "y"], menu_labels: ["-X", "-Y", "X", "Y"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ primaryaxis != negz primaryaxis != z }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numjoints", label: "Number of Joints", num_components: 1, default_value: [6], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "segmentlength", label: "Segment Length", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fixedlength", label: "Fixed Length", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "extrapolate", label: "Extrapolate", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "extrapolatealong", label: "Extrapolate Along", menu_items: ["controlaxis", "curvetangent"], menu_labels: ["Control Axis", "Curve Tangent"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ extrapolate == 0 }");
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "extrapolateaxis", label: "Extrapolate Axis", menu_items: ["negx", "negy", "negz", "x", "y", "z"], menu_labels: ["-X", "-Y", "-Z", "X", "Y", "Z"], default_value: 5, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ extrapolate == 0 extrapolatealong == curvetangent }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "sticky", label: "Sticky", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "twistattrib", label: "Twist Attrbute", num_components: 1, default_value: ["twist"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "nameprefix", label: "Resampled Point Name Prefix", num_components: 1, default_value: ["point_"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/kinefx::resamplesplinetransforms',_hnt_SOP_kinefx__resamplesplinetransforms)
    return _hnt_SOP_kinefx__resamplesplinetransforms
}
        