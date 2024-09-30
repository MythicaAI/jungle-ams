
export default function (hou) {
    class _hnt_TOP_jsoninput extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Data/jsoninput';
        static category = '/TOP';
        static houdiniType = 'jsoninput';
        static title = 'JSON Input';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_jsoninput.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "toptabs3", label: "Node", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "pdg_workitemgeneration", label: "Generate When", menu_items: [], menu_labels: [], default_value: 2, icon_names: [], item_generator_script: "import pdg\nreturn pdg.generateWhenMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder0", label: "Source", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.MenuParmTemplate({name: "jsonsource", label: "JSON File", menu_items: ["0", "1"], menu_labels: ["Upstream Output File", "Custom File Path"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filetag", label: "File Tag", num_components: 1, default_value: ["file/json"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import pdg\nreturn pdg.resultTagMenu('file')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ jsonsource != 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filepath", label: "File Path", num_components: 1, default_value: ["`@pdg_input`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ jsonsource != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1", label: "Operation", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.IntParmTemplate({name: "op", label: "Operation", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["Retrieve", "Array Retrieve", "Deserialize"], menu_labels: ["Retrieve", "Array Retrieve", "Deserialize Work Item"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "attribcollision", label: "On Attribute Collision", menu_items: ["0", "1", "2"], menu_labels: ["Keep Upstream Attribute", "Keep JSON Attribute", "Report Warning"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 2 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "preserveinput", label: "Store Input JSON File", menu_items: ["0", "1", "2"], menu_labels: ["None", "File Attribute", "Output File"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 2 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "preserveinputattrib", label: "Attribute Name", num_components: 1, default_value: ["sourcefile"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ preserveinput != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 2 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "preserveindex", label: "Preserve Deserialized Item Index", default_value: true});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 2 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "keyerrormode", label: "On Query Failure", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["Add Warning", "Raise Error"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op == 2 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "prop", label: "Query", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "field", label: "Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "attributename", label: "Attribute Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ attributetype == 8 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "attributetype", label: "Store As", menu_items: ["7", "0", "1", "2", "3", "4", "5", "6", "8"], menu_labels: ["Automatic", "String", "Integer", "Float", "PyObject", "String Array", "Integer Array", "Float Array", "Unpacked Attributes"], default_value: 7, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "extractmult", label: "Data Extractions", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 0 }");
			hou_parm_template3.setScriptCallback("hou.pwd().hm().extractcb(kwargs, hou.pwd())");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "hou.pwd().hm().extractcb(kwargs, hou.pwd())", "script_callback_language": "python"});
			let hou_parm_template4 = new hou.StringParmTemplate({name: "query#", label: "Query", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setScriptCallback("hou.pwd().hm().extractcb(kwargs, hou.pwd())");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "hou.pwd().hm().extractcb(kwargs, hou.pwd())", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "attributename#", label: "Attribute Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ valtype# == 8 }");
			hou_parm_template4.setScriptCallback("hou.pwd().hm().extractcb(kwargs, hou.pwd())");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "hou.pwd().hm().extractcb(kwargs, hou.pwd())", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.MenuParmTemplate({name: "valtype#", label: "Store As", menu_items: ["7", "0", "1", "2", "3", "4", "5", "6", "8"], menu_labels: ["Automatic", "String", "Integer", "Float", "PyObject", "String Array", "Integer Array", "Float Array", "Unpacked Attributes"], default_value: 7, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template4.setScriptCallback("hou.pwd().hm().extractcb(kwargs, hou.pwd())");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "hou.pwd().hm().extractcb(kwargs, hou.pwd())", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "valindex#", label: "PDG Value Index", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ valtype# == 3 } { valtype# == 4 } { valtype# == 5 } { valtype# == 6 } { valtype# == 7 } { valtype# == 8 }");
			hou_parm_template4.setScriptCallback("hou.pwd().hm().extractcb(kwargs, hou.pwd())");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback": "hou.pwd().hm().extractcb(kwargs, hou.pwd())", "script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "splitarray", label: "Split Array into Separate Work Items", default_value: true});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ attributetype == 3 } { attributetype == 4 } { attributetype == 5 } { attributetype == 6 } { attributetype == 7 } { attributetype == 8 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ op != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "extracts", label: "Extract String", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "toptabs3_1", label: "Files", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "pdgnodedeps", label: "File Dependencies", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Data/jsoninput',_hnt_TOP_jsoninput)
    return _hnt_TOP_jsoninput
}
        