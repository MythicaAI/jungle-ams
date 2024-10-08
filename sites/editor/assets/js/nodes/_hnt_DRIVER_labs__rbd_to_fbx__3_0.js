
export default function (hou) {
    class _hnt_DRIVER_labs__rbd_to_fbx__3_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DRIVER/Labs/Game Engine/labs::rbd_to_fbx::3.0';
        static category = '/DRIVER/labs';
        static houdiniType = 'labs::rbd_to_fbx::3.0';
        static title = 'Labs RBD to FBX';
        static icon = '/editor/assets/imgs/nodes/_hnt_DRIVER_labs__rbd_to_fbx__3_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DRIVER'];
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
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_settings", label: "Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "node_to_export", label: "Node To Export", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"opfilter": "!!SOP!!", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "export_path", label: "Export Path", num_components: 1, default_value: ["$HIP/export/${HIPNAME}.fbx"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"filechooser_pattern": "*fbx"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "f", label: "Start/End/Inc", num_components: 3, default_value: [0, 0, 1], default_expression: ["$RFSTART", "$RFEND", ""], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import hou\n\nnode = kwargs[\'node\']\n\n\nAllGroupNames = set(node.node(\"Import/COPY/object_merge1\").geometry().primGroups())\nGroupPairs = [[x.name(), x.name()] for x in AllGroupNames]\n\nreturn sum(GroupPairs, [])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_advanced", label: "Advanced", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bOverrideName", label: "Override Name", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "sNameOverride", label: "Name Override", num_components: 1, default_value: ["piece_"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bOverrideName == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "convertaxis", label: "Convert Axis System", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "axissystem", label: "Axis System", menu_items: [], menu_labels: [], default_value: 0, default_expression: "yupright", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "opmenu -l -a filmboxfbx1 axissystem", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ convertaxis == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "convertunits", label: "Convert Units", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "exportkind", label: "Export in ASCII Format", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_roottransform", label: "Root Transform", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "t", label: "Translate", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setTags({"autoscope": "1110000000000000", "script_action": "import objecttoolutils\nobjecttoolutils.matchTransform(kwargs, 0)", "script_action_help": "Select an object to match the translation with.", "script_action_icon": "BUTTONS_match_transform"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "r", label: "Rotate", num_components: 3, default_value: [0, 0, 0], min: 0, max: 360, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setTags({"autoscope": "1110000000000000", "script_action": "import objecttoolutils\nobjecttoolutils.matchTransform(kwargs, 1)", "script_action_help": "Select an object to match the rotation with.", "script_action_icon": "BUTTONS_match_rotation"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "s", label: "Scale", num_components: 3, default_value: [1, 1, 1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setTags({"autoscope": "1110000000000000", "script_action": "import objecttoolutils\nobjecttoolutils.matchTransform(kwargs, 2)", "script_action_help": "Select an object to match the scale with.", "script_action_icon": "BUTTONS_match_scale"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "p", label: "Pivot", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_action": "import objecttoolutils\nobjecttoolutils.matchTransform(kwargs, 3)", "script_action_help": "Select an object to match the pivot with.", "script_action_icon": "BUTTONS_match_pivot"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scale", label: "Uniform Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DRIVER/Labs/Game Engine/labs::rbd_to_fbx::3.0',_hnt_DRIVER_labs__rbd_to_fbx__3_0)
    return _hnt_DRIVER_labs__rbd_to_fbx__3_0
}
        