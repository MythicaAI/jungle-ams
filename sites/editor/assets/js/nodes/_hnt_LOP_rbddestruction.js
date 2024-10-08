
export default function (hou) {
    class _hnt_LOP_rbddestruction extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Destruction/rbddestruction';
        static category = '/LOP';
        static houdiniType = 'rbddestruction';
        static title = 'RBD Destruction';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_rbddestruction.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "input", label: "Input", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "primpattern", label: "Primitives", num_components: 1, default_value: ["`lopinputprims('.', 0)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True, inputidx = 0)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "importtime", label: "Import Frame", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "collisionprimpattern", label: "Collisions Primitives", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True, inputidx = 0)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "importtime2", label: "Import Frame", num_components: 1, default_value: [0], default_expression: ["$FF"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "output", label: "Output", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.IntParmTemplate({name: "outputtype", label: "Output Type", num_components: 1, default_value: [5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1", "2", "3", "4", "5"], menu_labels: ["Transforms", "Native Instances", "Point Instancer", "Deforming Mesh", "Dynamic Skinning", "Procedural"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "instancerpath", label: "Instancer Path", num_components: 1, default_value: ["/$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 2 }");
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True, inputidx = 0)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "referenceframe", label: "Reference Frame", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype == 3 } { outputtype != 4 showframe == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "pointlocation", label: "Points Location", menu_items: ["0", "1"], menu_labels: ["Primitive", "File Cache"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 5 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "pointprimitive", label: "Point Primitive", num_components: 1, default_value: ["/rbd_points/$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 5 } { pointlocation != 0 }");
			hou_parm_template2.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True, inputidx = 0)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "pointcache", label: "Point Cache", num_components: 1, default_value: ["$HIP/geo/$HIPNAME.$OS.$F.bgeo.sc"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 5 } { pointlocation != 1 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "previewprocedural", label: "Preview Procedural", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 5 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder0", label: "Cache Skeleton Animation", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 4 }");
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "behavior", label: "Cache Behavior", num_components: 1, default_value: ["cooked"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["all", "cooked", "uptocooked"], menu_labels: ["Always Cache All Frames", "Cache Cooked Frames", "Cache Up To Cooked Frames"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "cacherange", label: "Start/End/Inc", num_components: 3, default_value: [0, 0, 0], default_expression: ["@fstart", "@fend", "@finc"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1", label: "Cache Procedural", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 5 } { pointlocation == 1 }");
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.FloatParmTemplate({name: "procedural_cacherange", label: "Start/End/Inc", num_components: 3, default_value: [0, 0, 0], default_expression: ["@fstart", "@fend", "@finc"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "createsimproxy", label: "Create Simulation Proxy", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 0 outputtype != 2 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "blockgeometryproperties", label: "Block Geometry Properties", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype == 3 } { outputtype == 5 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bindgeomsubsetmaterials", label: "Bind Geometry Subset Materials", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype == 1 } { outputtype == 3 } { outputtype == 5 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "animatescales", label: "Animate Scales", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputtype != 4 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "outputframe", label: "Frame", num_components: 1, default_value: [0], default_expression: ["$FF"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "showframe", label: "showframe", num_components: 1, default_value: [0], default_expression: ["npoints(\"./sopnet/split_packed\")>0"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Destruction/rbddestruction',_hnt_LOP_rbddestruction)
    return _hnt_LOP_rbddestruction
}
        