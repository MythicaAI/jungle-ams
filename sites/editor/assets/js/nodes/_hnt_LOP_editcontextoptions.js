
export default function (hou) {
    class _hnt_LOP_editcontextoptions extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/editcontextoptions';
        static category = '/LOP';
        static houdiniType = 'editcontextoptions';
        static title = 'Edit Context Options';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_editcontextoptions.svg';
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
			let hou_parm_template = new hou.ToggleParmTemplate({name: "createoptionsblock", label: "Create Options Block", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "optionfolders", label: "Basic Options", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "optioncount", label: "Number of Options", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template3 = new hou.FolderParmTemplate({name: "optiongroup#", label: "", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			let hou_parm_template4 = new hou.ToggleParmTemplate({name: "optionenable#", label: "Enable", default_value: true});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "optionname#", label: "Option Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "optiontype#", label: "Option Type", num_components: 1, default_value: ["string"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["string", "float"], menu_labels: ["String", "Number"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "optionstrvalue#", label: "Option Value", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ optiontype# != string }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "optionfloatvalue#", label: "Option Value", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ optiontype# != float }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "optionfolders_1", label: "Time Based Options", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "tbsetcount", label: "Number of Option Sets", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template3 = new hou.FolderParmTemplate({name: "tbsetgroup#", label: "", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.FloatParmTemplate({name: "tboptionrange#", label: "Frame Range", num_components: 2, default_value: [1, 240], default_expression: ["$FSTART", "$FEND"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FolderParmTemplate({name: "tbset#optioncount", label: "Number of Options", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template5 = new hou.FolderParmTemplate({name: "tbset#optiongroup#", label: "", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template5.setTags({"group_type": "simple"});
			let hou_parm_template6 = new hou.StringParmTemplate({name: "tbset#optionname#", label: "Option Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template6.setJoinWithNext(true);
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template6 = new hou.StringParmTemplate({name: "tbset#optiontype#", label: "Option Type", num_components: 1, default_value: ["string"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["string", "float"], menu_labels: ["String", "Number"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template6 = new hou.StringParmTemplate({name: "tbset#optionstrvalue#", label: "Option Value", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template6.setConditional(hou.parmCondType.HideWhen, "{ tbset#optiontype# != string }");
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template6 = new hou.FloatParmTemplate({name: "tbset#optionfloatvalue#", label: "Option Value", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template6.setConditional(hou.parmCondType.HideWhen, "{ tbset#optiontype# != float }");
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template4.addParmTemplate(hou_parm_template5);
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "optionfolders_2", label: "Pattern Matching Options", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "pmsetcount", label: "Number of Option Sets", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template3 = new hou.FolderParmTemplate({name: "pmsetgroup#", label: "", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.StringParmTemplate({name: "pmoptiondrivervalue#", label: "Option Driver Value", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "pmoptiontestpattern#", label: "Option Test Pattern", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FolderParmTemplate({name: "pmset#optioncount", label: "Number of Options", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template5 = new hou.FolderParmTemplate({name: "pmset#optiongroup#", label: "", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template5.setTags({"group_type": "simple"});
			hou_parm_template6 = new hou.StringParmTemplate({name: "pmset#optionname#", label: "Option Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template6.setJoinWithNext(true);
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template6 = new hou.StringParmTemplate({name: "pmset#optiontype#", label: "Option Type", num_components: 1, default_value: ["string"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["string", "float"], menu_labels: ["String", "Number"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template6 = new hou.StringParmTemplate({name: "pmset#optionstrvalue#", label: "Option Value", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template6.setConditional(hou.parmCondType.HideWhen, "{ pmset#optiontype# != string }");
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template6 = new hou.FloatParmTemplate({name: "pmset#optionfloatvalue#", label: "Option Value", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template6.setConditional(hou.parmCondType.HideWhen, "{ pmset#optiontype# != float }");
			hou_parm_template5.addParmTemplate(hou_parm_template6);
			hou_parm_template4.addParmTemplate(hou_parm_template5);
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/editcontextoptions',_hnt_LOP_editcontextoptions)
    return _hnt_LOP_editcontextoptions
}
        