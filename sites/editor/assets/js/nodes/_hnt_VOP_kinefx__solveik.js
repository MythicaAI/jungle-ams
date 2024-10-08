
export default function (hou) {
    class _hnt_VOP_kinefx__solveik extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/KineFX/kinefx::solveik';
        static category = '/VOP/kinefx';
        static houdiniType = 'kinefx::solveik';
        static title = 'IK Solver';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_kinefx__solveik.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
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
			hou_parm_template = new hou.MenuParmTemplate({name: "target_file", label: "Target File", menu_items: ["opinput:0", "opinput:1", "opinput:2", "opinput:3"], menu_labels: ["First Input", "Second Input", "Third Input", "Fourth Input"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == tm } { signature == ti } { signature == tma } { signature == ta }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "targets_group", label: "Target Points", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == tm } { signature == ti } { signature == tma } { signature == ta }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "ctrl_file", label: "Controls File", menu_items: ["opinput:0", "opinput:1", "opinput:2", "opinput:3"], menu_labels: ["First Input", "Second Input", "Third Input", "Fourth Input"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == m } { signature == tm } { signature == ma } { signature == tma }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "ctrls_group", label: "Control Points", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == m } { signature == ma } { signature == default } { signature == tm } { signature == ti } { signature == tma }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "ctrls_hideinputswhen", label: "ctrls_hideinputswhen", column_labels: [""]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == m } { signature == default } { signature == tm } { signature == ti }");
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "root_hideinputswhen", label: "root_hideinputswhen", column_labels: [""]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == ma } { signature == a } { signature == tma } { signature == ta }");
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "goal_hideinputswhen", label: "goal_hideinputswhen", column_labels: [""]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == ma } { signature == a } { signature == tma } { signature == ta }");
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "twist_hideinputswhen", label: "twist_hideinputswhen", column_labels: [""]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == ma } { signature == a } { signature == tma } { signature == ta }");
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "root_group", label: "Root", num_components: 1, default_value: ["0"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == m } { signature == tm } { signature == ma } { signature == a } { signature == tma } { signature == ta }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "goal_group", label: "Goal", num_components: 1, default_value: ["1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == m } { signature == tm } { signature == ma } { signature == a } { signature == tma } { signature == ta }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "twist_group", label: "Twist", num_components: 1, default_value: ["2"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == m } { signature == tm } { signature == ma } { signature == a } { signature == tma } { signature == ta }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "simplesolve", label: "Use Simple Solver for 2 or 3 joints.", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "stretch", label: "Stretch", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "stretch_tol", label: "Stretch Tolerance", num_components: 1, default_value: [0.001], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "squash", label: "Squash", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "lookataxis", label: "Look At Axis", menu_items: [], menu_labels: [], default_value: 1, icon_names: [], item_generator_script: "axes = [(\"0\", \"-X\"),(\"1\", \"-Y\"),(\"2\", \"-Z\"),(\"3\", \"X\"),(\"4\", \"Y\"),(\"5\", \"Z\")]\n\nreturn [item for sublist in axes for item in sublist]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template.setScriptCallback("kwargs[\'node\'].parm(\"lookupaxis\").set(hou.pwd().evalParm(\"lookupaxis\"))");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback": "kwargs[\'node\'].parm(\"lookupaxis\").set(hou.pwd().evalParm(\"lookupaxis\"))", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "lookupaxis", label: "Up Axis", menu_items: [], menu_labels: [], default_value: 2, icon_names: [], item_generator_script: "axes = [(\"0\", \"-X\"),(\"1\", \"-Y\"),(\"2\", \"-Z\"),(\"3\", \"X\"),(\"4\", \"Y\"),(\"5\", \"Z\")]\nlookat = kwargs[\'node\'].evalParm(\"lookataxis\")\n\nmy_axes = [axes[i] for i in range(6) if i % 3 != lookat % 3]\nreturn [item for sublist in my_axes for item in sublist]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "twistflag", label: "Twist Flag", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "twistoffset", label: "Twist Offset", num_components: 1, default_value: [0], min: null, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dampen", label: "Dampen", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "resiststraight", label: "Resist Straight", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "trackingthres", label: "Tracking Threshold", num_components: 1, default_value: [0.001], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "keeproot", label: "Keep Root Transform", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"hideinputswhen": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "keepscales", label: "Scale Mode", menu_items: ["0", "1"], menu_labels: ["Unit Scale", "Keep Target Scales"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "restanglesmode", label: "Rest Angles Mode", menu_items: ["0", "1", "2"], menu_labels: ["No Rest Angles", "Compute from Targets", "Compute from Rest Transforms"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ simplesolve == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/KineFX/kinefx::solveik',_hnt_VOP_kinefx__solveik)
    return _hnt_VOP_kinefx__solveik
}
        