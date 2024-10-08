
export default function (hou) {
    class _hnt_LOP_editmaterialproperties extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/editmaterialproperties';
        static category = '/LOP';
        static houdiniType = 'editmaterialproperties';
        static title = 'Edit Material Properties';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_editmaterialproperties.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "sample_group", label: "Frame Range/Subframes", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible", "sidefx::header_parm": "sample_behavior"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "sample_behavior", label: "Sampling Behavior", num_components: 1, default_value: ["single"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["single", "timedep", "multi"], menu_labels: ["Sample Current Frame", "Sample Frame Range If Input Is Not Time Dependent", "Sample Frame Range"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sample_f", label: "Start/End/Inc", num_components: 3, default_value: [1, 240, 1], default_expression: ["@fstart", "@fend", "@finc"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sample_behavior == single }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "sample_subframeenable", label: "Subframe Sampling", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "sample_subframegroup", label: "Subframe Sampling", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sample_subframeenable == 0 }");
			hou_parm_template2.setTags({"group_type": "simple", "sidefx::header_toggle": "sample_subframeenable"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "sample_shuttermode", label: "Shutter", num_components: 1, default_value: ["manual"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["cameraprim", "manual"], menu_labels: ["Use Camera Prim", "Specify Manually"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ sample_subframeenable == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "sample_shutterrange", label: "Shutter Open/Close", num_components: 2, default_value: [null, 0.25], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ sample_shuttermode == cameraprim } { sample_subframeenable == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "sample_cameraprim", label: "Camera Prim", num_components: 1, default_value: ["/cameras/camera1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import expressionmenu\nreturn expressionmenu.buildExpressionsMenu(('Lop/primpath',))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ sample_shuttermode == manual } { sample_subframeenable == 0 }");
			hou_parm_template3.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "sample_count", label: "Samples", num_components: 1, default_value: [2], min: 2, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ sample_subframeenable == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "sample_includeframe", label: "Always Include Frame Sample", default_value: true});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ sample_subframeenable == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "primpattern", label: "Primitives", num_components: 1, default_value: ["`lopinputprims('.', 0)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPatternMenu(kwargs['node'], 0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, True)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "createparms", label: "Create Parameters"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "reftype", label: "Reference Type", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "reference", "inherit", "specialize", "createclass"], menu_labels: ["None", "Reference", "Inherit", "Specialize", "Create Class"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "classancestor", label: "Class Ancestor", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ reftype != createclass }");
			hou_parm_template.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "destinationprim_group", label: "Destination Primitive", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ reftype == none } { reftype == createclass }");
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "refparentmat", label: "Reference Parent Material", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "primpath", label: "Primitive Path", num_components: 1, default_value: ["/materials/$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import expressionmenu\nreturn expressionmenu.buildExpressionsMenu(\n    ('Lop/primpath', 'Lop/reference/primpath'))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"script_action": "import loputils\nkwargs['ctrl'] = True\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive using the primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "parentprimtype", label: "Parent Primitive Type", num_components: 1, default_value: ["UsdGeomScope"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createParentTypesMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/editmaterialproperties',_hnt_LOP_editmaterialproperties)
    return _hnt_LOP_editmaterialproperties
}
        