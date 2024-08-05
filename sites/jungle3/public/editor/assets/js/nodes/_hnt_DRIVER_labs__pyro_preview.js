
export default function (hou) {
    class _hnt_DRIVER_labs__pyro_preview extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DRIVER/Labs/labs::pyro_preview';
        static category = '/DRIVER/labs';
        static houdiniType = 'labs::pyro_preview';
        static title = 'Labs Pyro Preview ROP';
        static icon = '/editor/assets/imgs/nodes/_hnt_DRIVER_labs__pyro_preview.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['DRIVER'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "execute", label: "Render"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "renderdialog", label: "Controls..."});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "add_light_rig", label: "Add Light Rig"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().create_env_light_rig()");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().create_env_light_rig()", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "remove_light_rig", label: "Remove Light Rig"});
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().destroy_env_light_rig()");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().destroy_env_light_rig()", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "trange", label: "Valid Frame Range", menu_items: ["off", "normal", "on"], menu_labels: ["Render Current Frame", "Render Frame Range", "Render Frame Range Only (Strict)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "f", label: "Start/End/Inc", num_components: 3, default_value: [0, 0, 1], default_expression: ["$FSTART", "$FEND", ""], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "take", label: "Render With Take", num_components: 1, default_value: ["_current_"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l pyro_preview_settings take", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "camera", label: "Camera", num_components: 1, default_value: ["/obj/cam1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "opfilter": "!!OBJ/CAMERA!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "override_camerares", label: "Override Camera Resolution", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "res_fraction", label: "Resolution Scale", num_components: 1, default_value: ["0.5"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["0.1", "0.2", "0.25", "0.3333333", "0.5", "0.6666666", "0.75", "specific"], menu_labels: ["1/10 (One Tenth Resolution)", "1/5 (One Fifth Resolution)", "1/4 (Quarter Resolution)", "1/3 (One Third Resolution)", "1/2 (Half Resolution)", "2/3 (Two Thirds Resolution)", "3/4 (Three Quarter Resolution)", "User Specified Resolution"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ override_camerares == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "res_override", label: "Resolution", num_components: 2, default_value: [1280, 720], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ res_fraction != specific }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ override_camerares == 0 }");
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "res_overrideMenu", label: "Choose Resolution", menu_items: [], menu_labels: [], default_value: 0, default_expression: "640 480 1", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "opmenu -l pyro_preview_settings res_overrideMenu", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Mini, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ res_fraction != specific }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ override_camerares == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "aspect_override", label: "Pixel Aspect Ratio", num_components: 1, default_value: [1], min: 0.05, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ res_fraction != specific }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ override_camerares == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "vm_picture", label: "Output Picture", num_components: 1, default_value: ["$HIP/render/$HIPNAME.$OS.$F4.exr"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l pyro_preview_settings vm_picture", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "forceobject", label: "Force Objects", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReferenceList, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Objects will be output regardless of the state of their display flag");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "opfilter": "!!OBJ/GEOMETRY!!", "oprelative": "/obj"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "forcelights", label: "Force Lights", num_components: 1, default_value: ["@env_lightrig"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReferenceList, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Lights will be output regardless of the value of their dimmer channel");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "opfilter": "!!OBJ/LIGHT!!", "oprelative": "/obj"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "env_light_mult", label: "Env Light Intensity", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DRIVER/Labs/labs::pyro_preview',_hnt_DRIVER_labs__pyro_preview)
    return _hnt_DRIVER_labs__pyro_preview
}
        