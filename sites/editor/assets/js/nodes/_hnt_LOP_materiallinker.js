
export default function (hou) {
    class _hnt_LOP_materiallinker extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/materiallinker';
        static category = '/LOP';
        static houdiniType = 'materiallinker';
        static title = 'Material Linker';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_materiallinker.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "files_group", label: "File and Internal References", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_default": "1", "group_type": "collapsible"});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "num_files", label: "Number of References", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "enabled_#", label: "Enabled", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "createprims_#", label: "Action", menu_items: ["off", "on"], menu_labels: ["Edit Existing Primitives", "Create New Primitives"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "primpath_#", label: "Primitive Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import expressionmenu\nreturn expressionmenu.buildExpressionsMenu(\n    ('Lop/primpath', 'Lop/reference/primpath',\n     'Lop/primpattern', 'Lop/selectionrule'))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filepath_#", label: "File Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"filechooser_pattern": "*.usd, *.usda, *.usdc, *.usdz, *.mtlx"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filerefprimpath_#", label: "Reference Primitive Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"script_action": "import loputils\nnode = kwargs[\'node\']\nif node.evalParm(\'reftype\') in (\'prim\', \'inherit\', \'specialize\'):\n    prims = loputils.selectPrimsInParm(kwargs, True)\nelse:\n    parm = kwargs[\'parmtuple\'][0]\n    parm = node.parm(parm.name().replace(\n       \'filerefprimpath\', \'filepath\'))\n    prims = loputils.selectPrimsInParmFromFile(kwargs, False,\n        parm.evalAsString().strip(\'\\\'\"\'))", "script_action_help": "Select a primitive from this file.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathinput": "if(index(\"prim inherit specialize\", chs(\"reftype\")) >= 0, 0, -1)", "sidefx::usdpathtype": "prim"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "file_spacer_#"});
			hou_parm_template3.setTags({"sidefx::layout_height": "medium", "sidefx::look": "blank"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "reload", label: "Reload Files"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "links_group", label: "Links", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_default": "1", "group_type": "collapsible"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "num_links", label: "Number of Links", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "link_enabled_#", label: "Enabled", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "link_id_#", label: "Id", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.hide(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "link_prim_#", label: "Primitive", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "link_includes_#", label: "Includes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True, allowinstanceproxies=True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "link_excludes_#", label: "Excludes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True, allowinstanceproxies=True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "link_type_#", label: "Type", num_components: 1, default_value: ["materialdirect"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["materialdirect", "materialcollection"], menu_labels: ["Direct Binding", "Collection Binding"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "link_reversed_#", label: "Reversed", default_value: false});
			hou_parm_template3.hide(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "uiconfig", label: "UI Configuration", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/materiallinker',_hnt_LOP_materiallinker)
    return _hnt_LOP_materiallinker
}
        