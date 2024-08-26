
export default function (hou) {
    class _hnt_SOP_crowdmotionpath extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Crowds/crowdmotionpath';
        static category = '/SOP';
        static houdiniType = 'crowdmotionpath';
        static title = 'Crowd MotionPath';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_crowdmotionpath.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "sourcemode", label: "Source Mode", menu_items: ["clip", "sim"], menu_labels: ["Clip", "Simulation"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "framerange", label: "Start/End/Inc", num_components: 3, default_value: [0, 0, 1], default_expression: ["$FSTART", "$FEND", ""], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "transferattribs", label: "Transfer Attributes", num_components: 1, default_value: ["agentname"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs[\'node\'].generateInputAttribMenu(0, pattern=\"* ^P\")", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "transfergroups", label: "Transfer Groups", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs['node'].generateInputGroupMenu(0, include_name_attrib=False, parm=kwargs['parm'])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder_clipassignment", label: "Clip Assignment", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			hou_parm_template.setTabConditional(hou.parmCondType.DisableWhen, "{ sourcemode != clip }");
			hou_parm_template.setTabConditional(hou.parmCondType.HideWhen, "{ sourcemode != clip }");
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "numassignments", label: "Number of Assignments", folder_type: hou.folderType.TabbedMultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "group#", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "group_type = hou.ch(\"grouptype{0}\".format(kwargs[\"script_multiparm_index\"]))\nif group_type == 0:\n    geo_types = (hou.geometryType.Primitives, hou.geometryType.Points)\nelif group_type == 1:\n    geo_types = (hou.geometryType.Points, )\nelif group_type == 2:\n    geo_types = (hou.geometryType.Primitives, )\n\nreturn kwargs[\'node\'].generateInputGroupMenu(0, geo_types, parm=kwargs[\'parm\'])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = hou.geometryType.Primitives\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "grouptype#", label: "Group Type", menu_items: ["guess", "points", "prims"], menu_labels: ["Guess from Group", "Points", "Primitives"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clipnameseed#", label: "Random Seed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "numclippatterns#", label: "Clip Groups", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template4 = new hou.StringParmTemplate({name: "clippattern#_#", label: "Clip Names", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\n\ngroup_str = hou.ch(\"group{0}\".format(kwargs[\"script_multiparm_index2\"]))\ngroup_type_val = hou.ch(\"grouptype{0}\".format(kwargs[\"script_multiparm_index2\"]))\ngroup_type = None # guess from group\nif group_type_val == 1:\n    group_type = hou.geometryType.Points\nelif group_type_val == 2:\n    group_type = hou.geometryType.Primitives\n\nreturn crowdstoolutils.buildClipMenu(hou.pwd(), group_str=group_str, include_clip_properties=True, group_type=group_type)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "clipweight#_#", label: "Weight", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm2_#"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "setinitialcliptime#", label: "Set Initial Clip Time", default_value: false});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "initialcliptime#", label: "Initial Clip Time", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ setinitialcliptime# == 0 }");
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "cliptimeunits#", label: "Clip Time Units", menu_items: ["seconds", "phase"], menu_labels: ["Seconds", "Phase"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ setinitialcliptime# == 0 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "randomizecliptime#", label: "Randomize Clip Time", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ setinitialcliptime# == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ setinitialcliptime# == 0 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "randomclipoffset#", label: "Random Clip Offset", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ randomizecliptime# == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ setinitialcliptime# == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clipoffsetseed#", label: "Clip Offset Seed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ randomizecliptime# == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ randomizecliptime# == 0 } { setinitialcliptime# == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm#"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clipspeed#", label: "Clip Speed", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ clipspeedmode# == attrib }");
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "clipspeedmode#", label: "Clip Speed Mode", menu_items: ["uniform", "varying", "attrib"], menu_labels: ["Set Uniform", "Set Varying", "Use Attribute"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_action": "import soptoolutils\n\nnode = kwargs[\"node\"]\nmultiparm_idx = kwargs[\"script_multiparm_index\"]\n\nparm = kwargs[\"parmtuple\"][0]\nparm.set(\"attrib\")\n\nparm_vals = {\n    \'parms\': {\n        \'attrib\': node.evalParm(\'clipspeedattrib{}\'.format(multiparm_idx)),\n        \'valuetype\': \'rand\',\n        \'minvalue\': 0.5,\n        \'maxvalue\': 1.5\n    }\n}\n\nsoptoolutils.buildAttribAdjustFromActionButton(kwargs, \"attribadjustfloat\", parm_vals)\n", "script_action_help": "Create a randomization node to further tweak the parameter's value.", "script_action_icon": "BUTTONS_randomize", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clipspeedvariance#", label: "Variance (%)", num_components: 1, default_value: [10], min: 0, max: 100, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ clipspeedmode# != varying }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ clipspeedmode# != varying }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clipspeedseed#", label: "Variance Seed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ clipspeedmode# != varying }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ clipspeedmode# != varying }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "clipspeedattrib#", label: "Clip Speed Attribute", num_components: 1, default_value: ["clipspeed"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs['node'].generateInputAttribMenu(0, hou.attribType.Point, hou.attribData.Float, max_size=1, array_type=False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ clipspeedmode# != attrib }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ clipspeedmode# != attrib }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm3_#"});
			hou_parm_template3.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Crowds/crowdmotionpath',_hnt_SOP_crowdmotionpath)
    return _hnt_SOP_crowdmotionpath
}
        