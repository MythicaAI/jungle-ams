
export default function (hou) {
    class _hnt_TOP_shotgunfind extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Version Control/shotgunfind';
        static category = '/TOP';
        static houdiniType = 'shotgunfind';
        static title = 'ShotGrid Find';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_shotgunfind.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "pdg_workitemgeneration", label: "Generate When", menu_items: [], menu_labels: [], default_value: 2, icon_names: [], item_generator_script: "import pdg\nreturn pdg.generateWhenMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "entitytype", label: "Entity Type", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ActionMenuItem", "ApiUser", "ApiUserProjectConnection", "AppWelcomeUserConnection", "Asset", "AssetAssetConnection", "AssetBlendshapeConnection", "AssetElementConnection", "AssetEpisodeConnection", "AssetLevelConnection", "AssetMocapTakeConnection", "AssetSceneConnection", "AssetSequenceConnection", "AssetShootDayConnection", "AssetShotConnection", "Attachment", "BannerUserConnection", "Booking", "CameraMocapTakeConnection", "ClientUser", "Composition", "Cut", "CutItem", "CutVersionConnection", "Department", "ElementShotConnection", "EventLogEntry", "FilesystemLocation", "Group", "GroupUserConnection", "HumanUser", "Icon", "LaunchSceneConnection", "LaunchShotConnection", "LocalStorage", "MocapTakeRangeShotConnection", "Note", "Page", "PageHit", "PageSetting", "PerformerMocapTakeConnection", "PerformerRoutineConnection", "PerformerShootDayConnection", "PermissionRuleSet", "Phase", "PhysicalAssetMocapTakeConnection", "PipelineConfiguration", "PipelineConfigurationUserConnection", "Playlist", "PlaylistShare", "PlaylistVersionConnection", "Project", "ProjectTaskTemplateConnection", "ProjectUserConnection", "PublishedFile", "PublishedFileDependency", "PublishedFileType", "ReleaseTicketConnection", "Reply", "RevisionRevisionConnection", "RevisionTicketConnection", "RvLicense", "Sequence", "ShootDaySceneConnection", "Shot", "ShotShotConnection", "Software", "Status", "Step", "Tag", "Task", "TaskDependency", "TaskTemplate", "Ticket", "TicketTicketConnection", "TimeLog", "Version"], menu_labels: ["ActionMenuItem", "ApiUser", "ApiUserProjectConnection", "AppWelcomeUserConnection", "Asset", "AssetAssetConnection", "AssetBlendshapeConnection", "AssetElementConnection", "AssetEpisodeConnection", "AssetLevelConnection", "AssetMocapTakeConnection", "AssetSceneConnection", "AssetSequenceConnection", "AssetShootDayConnection", "AssetShotConnection", "Attachment", "BannerUserConnection", "Booking", "CameraMocapTakeConnection", "ClientUser", "Composition", "Cut", "CutItem", "CutVersionConnection", "Department", "ElementShotConnection", "EventLogEntry", "FilesystemLocation", "Group", "GroupUserConnection", "HumanUser", "Icon", "LaunchSceneConnection", "LaunchShotConnection", "LocalStorage", "MocapTakeRangeShotConnection", "Note", "Page", "PageHit", "PageSetting", "PerformerMocapTakeConnection", "PerformerRoutineConnection", "PerformerShootDayConnection", "PermissionRuleSet", "Phase", "PhysicalAssetMocapTakeConnection", "PipelineConfiguration", "PipelineConfigurationUserConnection", "Playlist", "PlaylistShare", "PlaylistVersionConnection", "Project", "ProjectTaskTemplateConnection", "ProjectUserConnection", "PublishedFile", "PublishedFileDependency", "PublishedFileType", "ReleaseTicketConnection", "Reply", "RevisionRevisionConnection", "RevisionTicketConnection", "RvLicense", "Sequence", "ShootDaySceneConnection", "Shot", "ShotShotConnection", "Software", "Status", "Step", "Tag", "Task", "TaskDependency", "TaskTemplate", "Ticket", "TicketTicketConnection", "TimeLog", "Version"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "limit", label: "Limit", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ findall == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "findall", label: "Find All", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "renameattribute", label: "Rename Attribute", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "attributename", label: "Rename Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ renameattribute == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "query", label: "Query", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "queryterms", label: "Terms", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "hscript"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "queryfield_#", label: "Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "queryop_#", label: "Query Operator", menu_items: ["is", "is_not", "less_than", "greater_than", "contains", "not_contains", "starts_with", "ends_with", "between", "not_between", "in_last", "in_next", "in", "type_is", "type_is_not", "in_calendar_day", "in_calendar_week", "in_calendar_month", "name_contains", "name_not_contains", "name_starts_with", "name_ends_with"], menu_labels: ["is", "is not", "less than", "greater than", "contains", "not contains", "starts with", "ends with", "between", "not between", "in last", "in next", "in", "type is", "type is not", "in calendar day", "in calendar week", "in calendar month", "name contains", "name not contains", "name starts with", "name ends with"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "queryvalue_#", label: "Value", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "filteroperator", label: "Match", menu_items: ["all", "any"], menu_labels: ["All", "Any"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "return", label: "Return", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "returnfields", label: "Fields", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"multistartoffset": "1"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "returnfield_#", label: "Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "order", label: "Order", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "orderfields", label: "Fields", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "orderfield_#", label: "Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "orderdir_#", label: "Order Direction", menu_items: ["asc", "desc"], menu_labels: ["Ascending", "Descending"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "retiredonly", label: "Retired Only", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "includearchivedprojects", label: "Include Archived Projects", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Version Control/shotgunfind',_hnt_TOP_shotgunfind)
    return _hnt_TOP_shotgunfind
}
        