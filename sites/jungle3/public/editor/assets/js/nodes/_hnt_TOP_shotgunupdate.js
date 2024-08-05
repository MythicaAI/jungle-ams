
export default function (hou) {
    class _hnt_TOP_shotgunupdate extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Version Control/shotgunupdate';
        static category = '/TOP';
        static houdiniType = 'shotgunupdate';
        static title = 'ShotGrid Update';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_shotgunupdate.svg';
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
			hou_parm_template = new hou.IntParmTemplate({name: "entityid", label: "ID", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "data", label: "Data", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "datafields", label: "Fields", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "hscript"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "datafield_#", label: "Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.LabelParmTemplate({name: "labelparm#", label: "=", column_labels: ["="]});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "datavalue_#", label: "Value", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ clearvalue_# == 1 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "clearvalue_#", label: "Clear", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usemeupdatemodes", label: "Use Multi-Entity Update Modes", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "multientityupdatemodes", label: "Multi Entity Update Modes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template.setTabConditional(hou.parmCondType.DisableWhen, "{ usemeupdatemodes == 0 }");
			hou_parm_template2 = new hou.FolderParmTemplate({name: "meufields", label: "Fields", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "hscript"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "meufield_#", label: "Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "meumode_#", label: "Value", num_components: 1, default_value: ["set"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["set", "add", "remove"], menu_labels: ["Set", "Add", "Remove"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Version Control/shotgunupdate',_hnt_TOP_shotgunupdate)
    return _hnt_TOP_shotgunupdate
}
        