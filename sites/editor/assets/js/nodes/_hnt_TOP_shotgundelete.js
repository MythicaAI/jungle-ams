
export default function (hou) {
    class _hnt_TOP_shotgundelete extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Version Control/shotgundelete';
        static category = '/TOP';
        static houdiniType = 'shotgundelete';
        static title = 'ShotGrid Delete';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_shotgundelete.svg';
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
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Version Control/shotgundelete',_hnt_TOP_shotgundelete)
    return _hnt_TOP_shotgundelete
}
        