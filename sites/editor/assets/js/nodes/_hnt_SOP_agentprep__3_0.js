
export default function (hou) {
    class _hnt_SOP_agentprep__3_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Crowds/agentprep::3.0';
        static category = '/SOP';
        static houdiniType = 'agentprep::3.0';
        static title = 'Agent Prep';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_agentprep__3_0.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a attribwrangle1 group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('grouptype')\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Agent", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "restclip", label: "Rest Clip", num_components: 1, default_value: ["rest"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildClipMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm4"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "upperlimbs", label: "Upper Limbs", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "upperarm#", label: "Upper Arm", num_components: 1, default_value: ["LeftArm_To_LeftForeArm"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "lowerarm#", label: "Lower Arm", num_components: 1, default_value: ["LeftForeArm_To_LeftHand"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "hand#", label: "Hand", num_components: 1, default_value: ["LeftFingerBase_To_LeftHandIndex1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm#_3"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "torso", label: "Torso", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "hips#", label: "Hips", num_components: 1, default_value: ["Hips"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "lowerback#", label: "Lower Back", num_components: 1, default_value: ["Hips_To_LowerBack"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "head#", label: "Head", num_components: 1, default_value: ["Head_To_HeadEnd"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "eyeoffset#", label: "Eye Offset", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "eyes#", label: "Eyes", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template4 = new hou.StringParmTemplate({name: "eye#_#", label: "Eye", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template4.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm#_4"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "lowerlimbs", label: "Lower Limbs", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "upperleg#", label: "Upper Leg", num_components: 1, default_value: ["LeftUpLeg_To_LeftLeg"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "knee#", label: "Knee", num_components: 1, default_value: ["LeftLeg_To_LeftFoot"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "ankle#", label: "Ankle", num_components: 1, default_value: ["LeftFoot_To_LeftToeBase"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "toe#", label: "Toe", num_components: 1, default_value: ["LeftToeBase_To_LeftToeBaseEnd"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'])", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm#_5"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "ankledownchannel#", label: "Ankle Plant Channel", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildClipChannelMenu(hou.node(\"create_attributes\"))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "footdownchannel#", label: "Toe Plant Channel", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildClipChannelMenu(hou.node(\"create_attributes\"))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm#_2"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "ankleoffset#", label: "Ankle Offset", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "toeoffset#", label: "Toe Offset", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_1", label: "Additional Channels", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "choppaths", label: "Modified Clips", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"opfilter": "!!CHOP!!", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "createchopnet", label: "Create Foot Plant CHOP Network"});
			hou_parm_template2.setScriptCallback("kwargs['node'].hdaModule().buildChopNetwork(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "kwargs['node'].hdaModule().buildChopNetwork(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "loadclips", label: "Load Clips", default_value: true});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "clipsource", label: "Source", menu_items: ["chop", "file"], menu_labels: ["CHOP", "File"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ loadclips == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "keepexternalref", label: "Keep External References", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ loadclips == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ clipsource != file }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "reloadclips", label: "Reload Clips"});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ loadclips == 0 }");
			hou_parm_template2.setScriptCallback("opcook -F `oppwf()`/load_clips/attribvop1");
			hou_parm_template2.setTags({"script_callback": "opcook -F `oppwf()`/load_clips/attribvop1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "agentname", label: "Agent Name", num_components: 1, default_value: ["agent1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ clipsource != file } { loadclips == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "cachedir", label: "Cache Directory", num_components: 1, default_value: ["${HIP}/agents/${AGENT}"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ clipsource != file } { loadclips == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "clippaths", label: "Clip Paths", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_clip.${CLIP}_modified.bclip.sc"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ clipsource != file } { loadclips == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "saveclips", label: "Cache Modified Clips to Disk"});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ clipsource != file } { loadclips == 0 }");
			hou_parm_template2.setScriptCallback("hou.node(\"clip_ropnet/save_clips\").render()");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.node(\"clip_ropnet/save_clips\").render()", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_2", label: "Guides", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "guidescale", label: "Scale", num_components: 1, default_value: [0.1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Crowds/agentprep::3.0',_hnt_SOP_agentprep__3_0)
    return _hnt_SOP_agentprep__3_0
}
        