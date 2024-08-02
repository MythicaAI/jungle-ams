
export default function (hou) {
    class _hnt_SOP_packfolder extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'SOP/Other/packfolder';
        static category = '/SOP';
        static houdiniType = 'packfolder';
        static title = 'Pack Folder';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_packfolder.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "folder", label: "Parent Folder", num_components: 1, default_value: ["/"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_action": "from kinefx.ui import rigtreeutils\nrigtreeutils.selectPointGroupParm(kwargs, single_selection=True, folders_mode=True)\n", "script_action_help": "Select an existing folder on the first input from a rig tree pane. First input must be connected.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "method", label: "Replace Method", menu_items: ["addreplace", "addkeep", "replace"], menu_labels: ["Add and Replace", "Add and Keep Existing", "Replace"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "pack", label: "Pack Output", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "onlypackunpacked", label: "Only Pack Unpacked", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ pack != 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "ignoreempty", label: "Ignore Empty Inputs", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reloadnames", label: "Reload Names"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "names", label: "Names", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"multistartoffset": "1"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "useinput#", label: "Use Input #", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "name#", label: "Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "from packfoldermenu import packFolderMenu\npackFolderMenu(kwargs, 'NamesMenu')", "script_action_help": "Set the name from input", "script_action_icon": "BUTTONS_flatlist", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "type#", label: "Type", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "from packfoldermenu import packFolderMenu\npackFolderMenu(kwargs, 'TypesMenu')", "script_action_help": "Set the type from input or from common extensions", "script_action_icon": "BUTTONS_flatlist", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "visible#", label: "Visible", menu_items: ["default", "folder"], menu_labels: ["![SCENEGRAPH_visible_on]Visible", "![SCENEGRAPH_visible_off]Not Visible"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"sidefx::look": "icon"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "treatasfolder#", label: "Treat as Folder", menu_items: ["default", "folder"], menu_labels: ["![BUTTONS_add]Add as Element", "![BUTTONS_addassetdirectory]Add as Folder"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# == shp } { type# == skel } { type# == rig } { type# == ctrl } { type# == char } { type# == graph }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"sidefx::look": "icon"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/packfolder',_hnt_SOP_packfolder)
    return _hnt_SOP_packfolder
}
        