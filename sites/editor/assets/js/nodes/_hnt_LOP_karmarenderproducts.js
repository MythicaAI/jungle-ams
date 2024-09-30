
export default function (hou) {
    class _hnt_LOP_karmarenderproducts extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Rendering/karmarenderproducts';
        static category = '/LOP';
        static houdiniType = 'karmarenderproducts';
        static title = 'Karma Render Products';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_karmarenderproducts.svg';
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
			let hou_parm_template = new hou.LabelParmTemplate({name: "spacer", label: "Spacer", column_labels: [""]});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "quicksetup", label: " ", menu_items: ["menu", "imageperaov"], menu_labels: ["Quick Setups\t↓", "Image per AOV"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallback("hou.phm().quickSetups(kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.phm().quickSetups(kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "parentprimpath", label: "Parent Primitive Path", num_components: 1, default_value: ["/Render/Products"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createPrimPathMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select a primitive in the Scene Viewer or Scene Graph Tree pane. Ctrl-click to select using the primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "script_callback": "", "script_callback_language": "python", "sidefx::usdpathtype": "prim"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "common", label: "Common Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "orderedVars", label: "Default Ordered Render Vars", num_components: 1, default_value: ["/Render/Products/Vars/*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a renderproduct orderedVars", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "sidefx::usdpathtype": "primlist", "usdvalueordered": "1", "usdvaluetype": "relationship"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "camera", label: "Default Camera", num_components: 1, default_value: ["/cameras/camera1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs.get(\"node\").hm().getCameras(kwargs)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)\n", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim", "usdvaluetype": "relationship"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "resolution", label: "Resolution", num_components: 2, default_value: [2048, 1080], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.hide(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "usdvaluetype": "int2"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "resolutionMenu", label: "Choose Resolution", menu_items: [], menu_labels: [], default_value: 0, default_expression: "640 480 1", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').parseDialogScriptMenu(\'FBres\')\")`", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Mini, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hide(true);
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setScriptCallback("opparm . resolution ( `arg(\"$script_value\", 0)` `arg(\"$script_value\", 1)` pixelAspectRatio ( `arg(\"$script_value\", 2)` )");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback": "opparm . resolution ( `arg(\"$script_value\", 0)` `arg(\"$script_value\", 1)` pixelAspectRatio ( `arg(\"$script_value\", 2)` )"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "instantaneousShutter", label: "Instantaneous Shutter", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.hide(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "usdvaluetype": "bool"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "aspectRatioConformPolicy", label: "Aspect Ratio Conform Policy", num_components: 1, default_value: ["expandAperture"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["expandAperture", "cropAperture", "adjustApertureWidth", "adjustApertureHeight", "adjustPixelAspectRatio"], menu_labels: ["Expand Aperture", "Crop Aperture", "Adjust Aperture Width", "Adjust Aperture Height", "Adjust Pixel Aspect Ratio"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.hide(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "usdvaluetype": "token"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "dataWindowNDC", label: "Data Window NDC", num_components: 4, default_value: [0, 0, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.hide(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "usdvaluetype": "float4"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "pixelAspectRatio", label: "Pixel Aspect Ratio", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.hide(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "usdvaluetype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "dooutputcs", label: "Output Colorspace", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "outputcs", label: "Output Colorspace", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').ocioColorSpaceMenu()\")`", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ dooutputcs == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Render Products", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "products", label: "Render Products", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template2.setTags({"multistartoffset": "0"});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "enable_#", label: "Enable", default_value: true});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "primname_#", label: "Name", num_components: 1, default_value: ["customproduct_#"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "productName_#", label: "Product Name", num_components: 1, default_value: ["$HIP/render/$HIPNAME.`chs(\"primname_#\")`.$F4.exr"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "usdvaluetype": "token"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "doorderedVars_#", label: "Ordered Render Vars", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "orderedVars_#", label: "Ordered Render Vars", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a renderproduct orderedVars", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 } { doorderedVars_# == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "sidefx::usdpathtype": "primlist", "usdvalueordered": "1", "usdvaluetype": "relationship"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "docamera_#", label: "Camera", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "camera_#", label: "Camera", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs.get(\"node\").hm().getCameras(kwargs)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 } { docamera_# == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)\n", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim", "usdvaluetype": "relationship"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "dooutputcs_#", label: "Output Colorspace", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nreturn loputils.createEditPropertiesControlMenu(kwargs, 'string')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setTags({"sidefx::look": "icon"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "outputcs_#", label: "Output Colorspace", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').ocioColorSpaceMenu()\")`", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable_# == 0 } { dooutputcs_# == none } { dooutputcs_# == block } { dooutputcs_# == setexisting dooutputcs == 0 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm#"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Rendering/karmarenderproducts',_hnt_LOP_karmarenderproducts)
    return _hnt_LOP_karmarenderproducts
}
        