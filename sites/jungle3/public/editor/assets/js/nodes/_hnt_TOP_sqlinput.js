
export default function (hou) {
    class _hnt_TOP_sqlinput extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Data/sqlinput';
        static category = '/TOP';
        static houdiniType = 'sqlinput';
        static title = 'SQL Input';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_sqlinput.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['TOP'];
            const outputs = ['TOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "tops", label: "tops", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "pdgnodedeps", label: "File Dependencies", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "pdgnodedep#", label: "Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Input", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template2 = new hou.MenuParmTemplate({name: "pdg_workitemgeneration", label: "Generate When", menu_items: [], menu_labels: [], default_value: 2, icon_names: [], item_generator_script: "import pdg\nreturn pdg.generateWhenMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "driver", label: "Type", num_components: 1, default_value: ["sqlite3"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["sqlite3", "psycopg2"], menu_labels: ["SQLite", "PostgreSQL"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "connectionstring", label: "Database", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"filechooser_mode": "read_and_write", "script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usecustomscript", label: "Use Custom Script", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "scriptpath", label: "Use Custom Script", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usecustomscript == 0 }");
			hou_parm_template2.setTags({"filechooser_mode": "read"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "queryparams_", label: "", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ overridequeryenabled == 1 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ usecustomscript == 1 }");
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "tablename", label: "Table Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ButtonParmTemplate({name: "generatequerybutton", label: "Force Regenerate Query"});
			hou_parm_template3.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "extractall", label: "Extract All", default_value: false});
			hou_parm_template3.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "distinct", label: "Distinct", default_value: false});
			hou_parm_template3.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "limit", label: "Limit", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "numcols", label: "Columns", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ extractall == 1 } { usecustomscript == 1 }");
			hou_parm_template3.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"multistartoffset": "1", "script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			let hou_parm_template4 = new hou.StringParmTemplate({name: "colname#", label: "Column Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "extracttag#", label: "Rename Column / Tag", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "extractindex#", label: "PDG Value Index", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "extracttype#", label: "PDG Data Type", num_components: 1, default_value: ["auto"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["string", "int", "float", "auto"], menu_labels: ["String", "Integer", "Float", "Auto"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FolderParmTemplate({name: "order_block_#", label: "Order By", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template4.setTags({"group_type": "collapsible"});
			let hou_parm_template5 = new hou.ToggleParmTemplate({name: "orderbyenabled#", label: "Enable", default_value: false});
			hou_parm_template5.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template5.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template5.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template4.addParmTemplate(hou_parm_template5);
			hou_parm_template5 = new hou.IntParmTemplate({name: "sortindex#", label: "Sort Index", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template5.setConditional(hou.parmCondType.DisableWhen, "{ orderbyenabled# == 0 }");
			hou_parm_template5.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template5.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template5.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template4.addParmTemplate(hou_parm_template5);
			hou_parm_template5 = new hou.StringParmTemplate({name: "sorttype#", label: "Sort Type", num_components: 1, default_value: ["ASC"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ASC", "DESC"], menu_labels: ["Ascending", "Descending"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template5.setConditional(hou.parmCondType.DisableWhen, "{ orderbyenabled# == 0 }");
			hou_parm_template5.setScriptCallback("kwargs['node'].hdaModule().generate_query(kwargs)");
			hou_parm_template5.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template5.setTags({"script_callback": "kwargs['node'].hdaModule().generate_query(kwargs)", "script_callback_language": "python"});
			hou_parm_template4.addParmTemplate(hou_parm_template5);
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_1", label: "Generated Query", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template.setTabConditional(hou.parmCondType.DisableWhen, "{ usecustomscript == 1 }");
			hou_parm_template.setTabConditional(hou.parmCondType.HideWhen, "{ usecustomscript == 1 }");
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "overridequeryenabled", label: "Override Query", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "querystring", label: "Query String", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ overridequeryenabled == 0 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"editor": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Data/sqlinput',_hnt_TOP_sqlinput)
    return _hnt_TOP_sqlinput
}
        