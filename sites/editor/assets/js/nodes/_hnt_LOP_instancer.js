
export default function (hou) {
    class _hnt_LOP_instancer extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Other/instancer';
        static category = '/LOP';
        static houdiniType = 'instancer';
        static title = 'Instancer';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_instancer.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP', 'LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "generalgroup", label: "General", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "primpath", label: "Primitive Path", num_components: 1, default_value: ["/$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPathMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "primkind", label: "Primitive Kind", num_components: 1, default_value: ["group"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createKindsMenu(True, False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "method", label: "Method", num_components: 1, default_value: ["pointinstancer"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["pointinstancer", "instanceablerefprims", "refprims", "instanceableinheritprims", "inheritprims", "instanceablespecializeprims", "specializeprims"], menu_labels: ["Point Instancer", "Instanceable Reference", "Reference", "Instanceable Inherit", "Inherit", "Instanceable Specialize", "Specialize"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "setextents", label: "Set Extents", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ method != pointinstancer }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "locgroup", label: "Target Points", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible", "sidefx::header_parm": "transformsourcemode"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "transformsourcemode", label: "Location Source", num_components: 1, default_value: ["intsop"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["intsop", "extsop", "prims", "points"], menu_labels: ["Internal SOP", "External SOP", "First Input's Primitives", "First Input's Points"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "locationpattern", label: "Location Primitives", num_components: 1, default_value: ["`lopinputprims('.', 0)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ transformsourcemode != prims transformsourcemode != points }");
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "pointsoppath", label: "SOP Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ transformsourcemode != extsop }");
			hou_parm_template2.setTags({"opfilter": "!!SOP!!", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "pointsopgroup", label: "Point Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ transformsourcemode != intsop transformsourcemode != extsop }");
			hou_parm_template2.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Points,)\nkwargs['inputindex'] = 0\nkwargs['noderefparm'] = kwargs['node'].parm('pointsoppath')\nsoputils.selectGroupParm(kwargs)\n", "script_action_help": "Select points to copy onto.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "prunemode", label: "Prune Mode", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "delete", "visibility"], menu_labels: ["None", "Delete", "Set Visibility"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "pruneamount", label: "Prune Amount", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ prunemode == none }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "setorient", label: "Set Orientation", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "setscale", label: "Set Scale", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "hidesourceprims", label: "Make Transform Source Primitives Invisible", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "attribs", label: "Point Attributes to Copy", num_components: 1, default_value: ["* ^__* ^usd* ^P ^N ^up ^orient ^v ^w ^accel"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ transformsourcemode == prims } { transformsourcemode == points method == pointinstancer }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "prims", label: "Primitive Naming", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ method == pointinstancer }");
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "instancename", label: "Instance Base Name", num_components: 1, default_value: ["Instance"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ method == pointinstancer }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usenameattrib", label: "Use Path Attribute", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ method == pointinstancer } { transformsourcemode != intsop transformsourcemode != extsop }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "makeuniquepaths", label: "Make Primitive Paths Unique", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usenameattrib == 0 } { method == pointinstancer } { transformsourcemode != intsop transformsourcemode != extsop }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "nameattrib", label: "Path Attribute", num_components: 1, default_value: ["path"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usenameattrib == 0 } { method == pointinstancer } { transformsourcemode != intsop transformsourcemode != extsop }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "protogroup", label: "Prototypes", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_default": "1", "group_type": "collapsible"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "protopattern", label: "Prototype Primitives", num_components: 1, default_value: ["`lopinputprims('.', 1)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 1)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot == 1 }");
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True, inputidxparmname=\"protosourcemode\")", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathinput": "strcmp(chs(\"protosourcemode\"), \"second\") == 0", "sidefx::usdpathtype": "primlist"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "protosourcemode", label: "Prototype Source", num_components: 1, default_value: ["second"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["first", "second"], menu_labels: ["First Input", "Second Input"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "protooptionsgroup", label: "Options", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "protoreftype", label: "Prototype Reference Type", num_components: 1, default_value: ["prim"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["prim", "inherit", "specialize"], menu_labels: ["Reference", "Inherit", "Specialize"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode != first }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "handlemissingprototypes", label: "Handle Missing Prototypes", num_components: 1, default_value: ["error"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["error", "warn"], menu_labels: ["Error for Missing Prototypes", "Warn for Missing Prototypes"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "hideprotosourceprims", label: "Make Prototype Source Primitives Invisible", default_value: true});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode != first }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "protouseroot", label: "Use Entire Stage as Prototype", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode != second }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "onlycopyprotoprims", label: "Only Copy Specified Prototype Primitives", default_value: true});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode != second } { protouseroot != 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "allowmissingprototypes", label: "Allow Prototype Primitives That Don't Exist", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot != 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "protorootkind", label: "Prototype Parent Kind", num_components: 1, default_value: ["group"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createKindsMenu(True, False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == first } { protouseroot == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "protoindexsrc", label: "Prototype Index", num_components: 1, default_value: ["random"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["random", "index", "indexattr", "nameattr", "pathattr"], menu_labels: ["Random", "Index", "Index Attribute", "Name Attribute", "Path Attribute"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot == 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "seed", label: "Seed", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot == 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ protoindexsrc != random }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "index", label: "Index", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot == 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ protoindexsrc != index }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "indexattr", label: "Index Attribute", num_components: 1, default_value: ["index"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot == 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ protoindexsrc != indexattr }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "nameattr", label: "Name Attribute", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot == 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ protoindexsrc != nameattr }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "pathattr", label: "Path Attribute", num_components: 1, default_value: ["path"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ protosourcemode == second protouseroot == 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ protoindexsrc != pathattr }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "warnonskipped", label: "Warn on Skipped Instances", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ protoindexsrc != pathattr protoindexsrc != nameattr protoindexsrc != indexattr }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/instancer',_hnt_LOP_instancer)
    return _hnt_LOP_instancer
}
        