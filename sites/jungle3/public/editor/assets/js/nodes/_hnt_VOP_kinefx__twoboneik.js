
export default function (hou) {
    class _hnt_VOP_kinefx__twoboneik extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/KineFX/kinefx::twoboneik';
        static category = '/VOP/kinefx';
        static houdiniType = 'kinefx::twoboneik';
        static title = 'Two Bone IK';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_kinefx__twoboneik.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "signature", label: "Signature", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_isparm": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "selectdriven", label: "Select Driven"});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallback("hou.phm().selectDriven(kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.phm().selectDriven(kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "selectdrivers", label: "Select Drivers"});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallback("hou.phm().selectDrivers(kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.phm().selectDrivers(kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "lookataxis_axis_i", label: "Look At Axis", menu_items: [], menu_labels: [], default_value: 1, icon_names: [], item_generator_script: "axes = [(\"0\", \"-X\"),(\"1\", \"-Y\"),(\"2\", \"-Z\"),(\"3\", \"X\"),(\"4\", \"Y\"),(\"5\", \"Z\")]\n\nreturn [item for sublist in axes for item in sublist]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "lookupaxis_axis_i", label: "Up Axis", menu_items: [], menu_labels: [], default_value: 2, icon_names: [], item_generator_script: "axes = [(\"0\", \"-X\"),(\"1\", \"-Y\"),(\"2\", \"-Z\"),(\"3\", \"X\"),(\"4\", \"Y\"),(\"5\", \"Z\")]\n\nreturn [item for sublist in axes for item in sublist]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "stretch", label: "Stretch", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "orienttip", label: "Orient Tip to Goal", default_value: true});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "blend", label: "Blend", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/KineFX/kinefx::twoboneik',_hnt_VOP_kinefx__twoboneik)
    return _hnt_VOP_kinefx__twoboneik
}
        