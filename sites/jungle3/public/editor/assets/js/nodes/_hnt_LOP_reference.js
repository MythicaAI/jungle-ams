
export default function (hou) {
    class _hnt_LOP_reference extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'LOP/Other/reference';
        static category = '/LOP';
        static houdiniType = 'reference';
        static title = 'Reference';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_reference.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "destinationprim_group", label: "Destination Primitive", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "primpattern", label: "Primitives", num_components: 1, default_value: ["`lopinputprims('.', 0)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ createprims == on }");
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "primpath", label: "Primitive Path", num_components: 1, default_value: ["/$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import expressionmenu\nreturn expressionmenu.buildExpressionsMenu(\n    ('Lop/primpath', 'Lop/reference/primpath'))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ createprims != on }");
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "createprims", label: "Action", menu_items: ["off", "on"], menu_labels: ["Edit", "Create"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "primkind", label: "Primitive Kind", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createKindsMenu(True, False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ createprims != on }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "parentprimtype", label: "Parent Primitive Type", num_components: 1, default_value: ["UsdGeomXform"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createParentTypesMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ createprims != on }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "instanceable", label: "Make Instanceable", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "composition_group", label: "Composition", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "reftype", label: "Reference Type", num_components: 1, default_value: ["file"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["file", "payload", "inputref", "inputpayload", "prim", "inherit", "specialize"], menu_labels: ["Reference Files", "Payload Files", "Reference From Multi-input", "Payload From Multi-input", "Reference From First Input", "Inherit From First Input", "Specialize From First Input"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "handlemissingfiles", label: "Handle Missing Files", num_components: 1, default_value: ["error"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["error", "warn", "ignore", "allow"], menu_labels: ["Error for Missing Files", "Warn for Missing Files", "Ignore Missing Files", "Allow Missing Files on the Stage"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ reftype != file reftype != payload }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "preop", label: "Pre-Operation", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "clearlayer", "clearall"], menu_labels: ["No Pre-operation", "Clear Reference Edits in Active Layer", "Clear All References"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "refeditop", label: "Reference Operation", num_components: 1, default_value: ["prependfront"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["prependfront", "prependback", "appendfront", "appendback", "remove"], menu_labels: ["Add as Strongest References in Prepend List", "Add as Weakest References in Prepend List", "Add as Strongest References in Append List", "Add as Weakest References in Append List", "Remove References"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "files_separator"});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ reftype != file reftype != payload }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "num_files", label: "Number of References", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ reftype == inputref } { reftype == inputpayload }");
			hou_parm_template2 = new hou.FolderParmTemplate({name: "referencefile_group#", label: "Reference", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "enable#", label: "Enable", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filepath#", label: "Reference File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ reftype == prim } { reftype == inherit } { reftype == specialize }");
			hou_parm_template3.setTags({"filechooser_pattern": "*.usd, *.usda, *.usdc, *.usdz, *.mtlx"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filerefprim#", label: "Reference Primitive", num_components: 1, default_value: ["automaticPrim"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["automaticPrim", "defaultPrim", ""], menu_labels: ["Reference Automatically Chosen Primitive", "Reference Default Primitive", "Reference Specific Primitive"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ reftype == prim } { reftype == inherit } { reftype == specialize }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filerefprimpath#", label: "Reference Primitive Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ filerefprim# != \\\"\\\" reftype != prim reftype != inherit reftype != specialize }");
			hou_parm_template3.setTags({"script_action": "import loputils\nnode = kwargs['node']\nif node.evalParm('reftype') in ('prim', 'inherit', 'specialize'):\n    prims = loputils.selectPrimsInParm(kwargs, True)\nelse:\n    parm = kwargs['parmtuple'][0]\n    parm = node.parm(parm.name().replace(\n       'filerefprimpath', 'filepath'))\n    prims = loputils.selectPrimsInParmFromFile(kwargs, False,\n        parm.evalAsString())", "script_action_help": "Select a primitive from this file.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathinput": "if(index(\"prim inherit specialize\", chs(\"reftype\")) >= 0, 0, -1)", "sidefx::usdpathtype": "prim"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "timeoffset#", label: "Time Offset (in Frames)", num_components: 1, default_value: [0], min: null, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "timescale#", label: "Time Scale", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload Files"});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ reftype != file reftype != payload }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "inputs_separator"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "refprim", label: "Reference Primitive", num_components: 1, default_value: ["automaticPrim"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["automaticPrim", "defaultPrim", ""], menu_labels: ["Reference Automatically Chosen Primitive", "Reference Default Primitive", "Reference Specific Primitive"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ reftype != inputref reftype != inputpayload }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "refprimpath", label: "Reference Primitive Path", num_components: 1, default_value: ["automaticPrim"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ refprim != \\\"\\\" }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ reftype != inputref reftype != inputpayload }");
			hou_parm_template.setTags({"script_action": "import loputils\nprims = loputils.selectPrimsInParm(kwargs, False, inputidx=1)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathinput": "1", "sidefx::usdpathtype": "prim"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/reference',_hnt_LOP_reference)
    return _hnt_LOP_reference
}
        