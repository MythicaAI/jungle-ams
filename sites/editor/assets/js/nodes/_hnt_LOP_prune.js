
export default function (hou) {
    class _hnt_LOP_prune extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/prune';
        static category = '/LOP';
        static houdiniType = 'prune';
        static title = 'Prune';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_prune.svg';
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
			let hou_parm_template = new hou.ToggleParmTemplate({name: "pruneunselected", label: "Prune Unselected", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "target", label: "Target Primitives", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "target_prims", label: "Target Primitives", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_default": "1", "group_type": "collapsible"});
			let hou_parm_template3 = new hou.FolderParmTemplate({name: "num_rules", label: "Target Rules", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template4 = new hou.ToggleParmTemplate({name: "enable#", label: "Enable", default_value: true});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "targetmethod#", label: "Target Method", num_components: 1, default_value: ["primpattern"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["primpattern", "bbox", "primtype", "primkind", "primpurpose", "vexpression"], menu_labels: ["Primitive Pattern", "Bounding Box", "Primitive Type", "Primitive Kind", "Primitive Purpose", "Vexpression"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "primpattern#", label: "Primitive Pattern", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != primpattern }");
			hou_parm_template4.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "bboxcontainment#", label: "Bounding Box Rule", num_components: 1, default_value: ["inside"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["inside", "outside", "insidepartial", "outsidepartial"], menu_labels: ["Fully Inside", "Fully Outside", "Partially or Fully Inside", "Partially or Fully Outside"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != bbox }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "bboxsize#", label: "Bounding Box Size", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != bbox }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "bboxcenter#", label: "Bounding Box Center", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != bbox }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "primtype#", label: "Primitive Type", num_components: 1, default_value: ["UsdGeomMesh"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createSchemaTypesMenu(False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != primtype }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "primkind#", label: "Primitive Kind", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createKindsMenu(False, False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != primkind }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "primpurpose#", label: "Primitive Purpose", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPurposesMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != primpurpose }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "vexpression#", label: "Vexpression", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ targetmethod# != vexpression }");
			hou_parm_template4.setTags({"editor": "1", "editorlang": "vex", "editorlines": "2-10"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "doexclusions", label: "Add Exclusions", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "exclude_prims", label: "Exclude Primitives", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ doexclusions == 0 }");
			hou_parm_template2.setTags({"group_default": "1", "group_type": "collapsible"});
			hou_parm_template3 = new hou.FolderParmTemplate({name: "exclude_rules", label: "Exclude Rules", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "excludeenable#", label: "Enable", default_value: true});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "excludetargetmethod#", label: "Target Method", num_components: 1, default_value: ["primpattern"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["primpattern", "bbox", "primtype", "primkind", "primpurpose", "vexpression"], menu_labels: ["Primitive Pattern", "Bounding Box", "Primitive Type", "Primitive Kind", "Primitive Purpose", "Vexpression"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "excludeprimpattern#", label: "Primitive Pattern", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != primpattern }");
			hou_parm_template4.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "excludebboxcontainment#", label: "Bounding Box Rule", num_components: 1, default_value: ["inside"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["inside", "outside", "insidepartial", "outsidepartial"], menu_labels: ["Fully Inside", "Fully Outside", "Partially or Fully Inside", "Partially or Fully Outside"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != bbox }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "excludebboxsize#", label: "Bounding Box Size", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != bbox }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "excludebboxcenter#", label: "Bounding Box Center", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != bbox }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "excludeprimtype#", label: "Primitive Type", num_components: 1, default_value: ["UsdGeomMesh"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createSchemaTypesMenu(False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != primtype }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "excludeprimkind#", label: "Primitive Kind", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createKindsMenu(False, False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != primkind }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "excludeprimpurpose#", label: "Primitive Purpose", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPurposesMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != primpurpose }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.StringParmTemplate({name: "excludevexpression#", label: "Vexpression", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ excludeenable# == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ excludetargetmethod# != vexpression }");
			hou_parm_template4.setTags({"editor": "1", "editorlang": "vex", "editorlines": "2-10"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "options", label: "Pruning Options", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "method", label: "Method", num_components: 1, default_value: ["makeinvisible"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["deactivate", "makeinvisible"], menu_labels: ["Deactivate", "Make Invisible"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "prune", label: "Prune", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "prunerestrictions", label: "Prune Restrictions", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "prunepointinstances", label: "Prune Point Instances Individually", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pruneancestors", label: "Prune Ancestors Automatically", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pruneclassprims", label: "Prune Class Primitives", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "collectiongroup", label: "Collection", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "createcollection", label: "Create Collection", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "collectionprimpath", label: "Collection Primitive", num_components: 1, default_value: ["/collections"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPathMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ createcollection == 0 }");
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "collectionname", label: "Collection Name", num_components: 1, default_value: ["pruned"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ createcollection == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/prune',_hnt_LOP_prune)
    return _hnt_LOP_prune
}
        