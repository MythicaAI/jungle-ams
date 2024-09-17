
export default function (hou) {
    class _hnt_SOP_labs__biome_profile__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/World Building/Biomes/labs::biome_profile::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::biome_profile::1.0';
        static title = 'Labs Biome Profile (Beta)';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__biome_profile__1_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = [];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm7"});
			hou_parm_template.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_profile", label: "Biome Profile", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "biomeprofile", label: "Biome Profile", num_components: 1, default_value: ["$HIP/data/biome/biomeprofile.json"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ environmentvar == 1 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallback("hou.phm().loadProfile(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().loadProfile(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "applysettingsnodes", label: "Sync Profile Paths"});
			hou_parm_template2.setScriptCallback("hou.phm().applyProfileToNodes(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().applyProfileToNodes(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "applysettings", label: "Apply Profile"});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ environmentvar != 1 }");
			hou_parm_template2.setScriptCallback("hou.phm().applyProfile(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"export_disable": "1", "script_callback": "hou.phm().applyProfile(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template2.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "loadsettings", label: "Reload Profile"});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallback("hou.phm().loadProfile(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().loadProfile(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "savesettings", label: "Save Profile"});
			hou_parm_template2.setScriptCallback("hou.phm().saveProfile(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"export_disable": "1", "script_callback": "hou.phm().saveProfile(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_settings", label: "Settings", folder_type: hou.folderType.ScrollingMultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "biomename#", label: "Biome", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "avgtemp#", label: "Average Temperature", num_components: 1, default_value: [0], min: null, max: 35, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "avgprecip#", label: "Average Precipitation", num_components: 1, default_value: [0], min: 100, max: 5000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm__4_#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm#_2"});
			hou_parm_template2.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/World Building/Biomes/labs::biome_profile::1.0',_hnt_SOP_labs__biome_profile__1_0)
    return _hnt_SOP_labs__biome_profile__1_0
}
        