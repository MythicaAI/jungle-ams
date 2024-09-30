
export default function (hou) {
    class _hnt_LOP_reference__2_0 extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'LOP/Other/reference::2.0';
        static category = '/LOP';
        static houdiniType = 'reference::2.0';
        static title = 'Reference';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_reference__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "main_switcher", label: "References", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "enable", label: "Enable", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "input_group", label: "Multi-input", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible", "sidefx::header_toggle": "enable"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "primpath", label: "Primitive Path", num_components: 1, default_value: ["/`@sourcename`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import expressionmenu\nreturn expressionmenu.buildExpressionsMenu(\n    ('Lop/primpath', 'Lop/reference/primpath',\n     'Lop/primpattern', 'Lop/selectionrule'))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "createprims", label: "Action", menu_items: ["off", "on"], menu_labels: ["Edit Existing Primitives", "Create New Primitives"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "primcount", label: "Primitive Count", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ createprims != on }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "reftype", label: "Reference Type", num_components: 1, default_value: ["file"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["file", "payload"], menu_labels: ["Reference Inputs", "Payload Inputs"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "instanceable", label: "Make Instanceable", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "refprim", label: "Reference Primitive", num_components: 1, default_value: ["automaticPrim"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["automaticPrim", "defaultPrim", ""], menu_labels: ["Reference Automatically Chosen Primitive", "Reference Default Primitive", "Reference Specific Primitive"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "refprimpath", label: "Reference Primitive Path", num_components: 1, default_value: ["automaticPrim"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ refprim != \\\"\\\" }");
			hou_parm_template3.setTags({"script_action": "import loputils\nprims = loputils.selectPrimsInParm(kwargs, False, inputidx=1)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathinput": "1", "sidefx::usdpathtype": "prim"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "files_group", label: "File and Internal References", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_default": "1", "group_type": "collapsible"});
			hou_parm_template3 = new hou.FolderParmTemplate({name: "num_files", label: "Number of References", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template4 = new hou.ToggleParmTemplate({name: "enable#", label: "Enable", default_value: true});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.MenuParmTemplate({name: "parameterorder#", label: "Parameter Order", menu_items: ["filefirst", "primfirst"], menu_labels: ["File Pattern Evaluated Before Primitive Path", "Primitive Path Evaluated Before File Pattern"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.MenuParmTemplate({name: "createprims#", label: "Action", menu_items: ["off", "on"], menu_labels: ["Edit Existing Primitives", "Create New Primitives"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "primpath#", label: "Primitive Path", num_components: 1, default_value: ["/`@sourcename`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import expressionmenu\nreturn expressionmenu.buildExpressionsMenu(\n    ('Lop/primpath', 'Lop/reference/primpath',\n     'Lop/primpattern', 'Lop/selectionrule'))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template4.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "primcount#", label: "Primitive Count", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ createprims# != on }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "reftype#", label: "Reference Type", num_components: 1, default_value: ["file"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["file", "payload", "prim", "inherit", "specialize"], menu_labels: ["Reference File", "Payload File", "Reference From First Input", "Inherit From First Input", "Specialize From First Input"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "instanceable#", label: "Make Instanceable", default_value: false});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "filepath#", label: "File Pattern", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ reftype# == prim } { reftype# == inherit } { reftype# == specialize }");
			hou_parm_template4.setTags({"script_action": "import parmutils\nparmutils.selectMultipleFilesForParm(kwargs['parmtuple'][0])", "script_action_help": "Open floating file chooser", "script_action_icon": "BUTTONS_chooser_file"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "filerefprim#", label: "Reference Primitive", num_components: 1, default_value: ["automaticPrim"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["automaticPrim", "defaultPrim", ""], menu_labels: ["Reference Automatically Chosen Primitive", "Reference Default Primitive", "Reference Specific Primitive"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ reftype# == prim } { reftype# == inherit } { reftype# == specialize }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "filerefprimpath#", label: "Reference Primitive Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ filerefprim# != \\\"\\\" reftype# != prim reftype# != inherit reftype# != specialize }");
			hou_parm_template4.setTags({"script_action": "import loputils\nnode = kwargs[\'node\']\nparm = kwargs[\'parmtuple\'][0]\nreftype = node.evalParm(parm.name().replace(\n    \'filerefprimpath\', \'reftype\'))\nif reftype in (\'prim\', \'inherit\', \'specialize\'):\n    prims = loputils.selectPrimsInParm(kwargs, True)\nelse:\n    parm = node.parm(parm.name().replace(\n       \'filerefprimpath\', \'filepath\'))\n    prims = loputils.selectPrimsInParmFromFile(kwargs, False,\n        parm.evalAsString().strip(\'\\\'\"\'))", "script_action_help": "Select a primitive from a primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathinput": "if(index(\"prim inherit specialize\", chs(\"reftype#\")) >= 0, 0, -1)", "sidefx::usdpathtype": "prim"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "timeoffset#", label: "Time Offset (in Frames)", num_components: 1, default_value: [0], min: null, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "timescale#", label: "Time Scale", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.SeparatorParmTemplate({name: "file_spacer#"});
			hou_parm_template4.setTags({"sidefx::layout_height": "medium", "sidefx::look": "blank"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ButtonParmTemplate({name: "reload", label: "Reload Files"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "main_switcher_1", label: "Created Primitives", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "primkind", label: "Primitive Kind", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createKindsMenu(True, False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "parentprimtype", label: "Parent Primitive Type", num_components: 1, default_value: ["UsdGeomXform"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createParentTypesMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "main_switcher_2", label: "Composition", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "handlemissingfiles", label: "Handle Missing Files", num_components: 1, default_value: ["error"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["error", "warn", "ignore", "allow"], menu_labels: ["Error for Missing Files", "Warn for Missing Files", "Ignore Missing Files", "Allow Missing Files on the Stage"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "preop", label: "Pre-Operation", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "clearlayer", "clearall"], menu_labels: ["No Pre-operation", "Clear Reference Edits in Active Layer", "Clear All References"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "refeditop", label: "Reference Operation", num_components: 1, default_value: ["prependfront"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["prependfront", "prependback", "appendfront", "appendback", "remove"], menu_labels: ["Add as Strongest References in Prepend List", "Add as Weakest References in Prepend List", "Add as Strongest References in Append List", "Add as Weakest References in Append List", "Remove References"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/reference::2.0',_hnt_LOP_reference__2_0)
    return _hnt_LOP_reference__2_0
}
        