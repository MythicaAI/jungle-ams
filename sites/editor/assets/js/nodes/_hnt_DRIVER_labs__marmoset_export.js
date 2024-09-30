
export default function (hou) {
    class _hnt_DRIVER_labs__marmoset_export extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DRIVER/Labs/labs::marmoset_export';
        static category = '/DRIVER/labs';
        static houdiniType = 'labs::marmoset_export';
        static title = 'Labs Marmoset ROP';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DRIVER'];
            const outputs = ['DRIVER'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "execute", label: "Render"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "renderdialog", label: "Controls..."});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2", label: "Mview Render", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "bOpenMarmoset", label: "Open Marmoset Viewer after Export", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vm_picture2", label: "Output", num_components: 1, default_value: ["$HIP/render/$HIPNAME.$OS.mview"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l mantra1 vm_picture", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "btnCreateMview", label: "Create Mview"});
			hou_parm_template2.setScriptCallback("kwargs['node'].hm().MviewRender()");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "kwargs['node'].hm().MviewRender()", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2_1", label: "Image Render", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: true});
			hou_parm_template2 = new hou.IntParmTemplate({name: "res_override", label: "Resolution", num_components: 2, default_value: [1920, 1080], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "res_overrideMenu", label: "Choose Resolution", menu_items: [], menu_labels: [], default_value: 0, icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').parseDialogScriptMenu(\'FBres\')\")`", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Mini, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setScriptCallback("opparm . res_override ( `arg(\"$script_value\", 0)` `arg(\"$script_value\", 1)` aspect_override ( `arg(\"$script_value\", 2)` )");
			hou_parm_template2.setTags({"script_callback": "opparm . res_override ( `arg(\"$script_value\", 0)` `arg(\"$script_value\", 1)` aspect_override ( `arg(\"$script_value\", 2)` )"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "mSampling", label: "Sampling", menu_items: ["1", "4", "9", "16", "25", "100", "400"], menu_labels: ["1x", "4x", "9x", "16x", "25x", "100x", "400x"], default_value: 6, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bTransparentBg", label: "Transparent Background", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vm_picture", label: "Output Picture", num_components: 1, default_value: ["$HIP/render/$HIPNAME.$OS.png"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l mantra1 vm_picture", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "btnRenderImage", label: "Render Image"});
			hou_parm_template2.setScriptCallback("kwargs['node'].hm().ImageRender()");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "kwargs['node'].hm().ImageRender()", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder3", label: "Rendering", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "camera", label: "Camera", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "opfilter": "!!OBJ/CAMERA!!", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "iFrameType", label: "Valid Frame Range", menu_items: ["0", "1"], menu_labels: ["Render Current Frame", "Render Frame Range"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "uFrameRange", label: "Frame Range", num_components: 2, default_value: [0, 0], default_expression: ["$RFSTART", "$RFEND"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ iFrameType == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vobject", label: "Candidate Objects", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReferenceList, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Objects will not be output if their display flag is off");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "opfilter": "!!OBJ!!", "oprelative": "/obj"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder4", label: "Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bCustomSkyLight", label: "Use Custom", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "mSkyLightPreset", label: "Preset", menu_items: ["Berlin Underpass.tbsky", "Bolonga Portico.tbsky", "Canada Glacier.tbsky", "Castle Sunset.tbsky", "Desert Road.tbsky", "Ennis House.tbsky", "Evening Clouds.tbsky", "Evening Construction.tbsky", "Forest Path.tbsky", "Garage.tbsky", "Grace Cathedral.tbsky", "Hedge Row.tbsky", "Indoor Fluorescents.tbsky", "Iowa Sunset.tbsky", "Lands End.tbsky", "Late Day Field.tbsky", "Mountain Sunset.tbsky", "Museum.tbsky", "Narita Plaza.tbsky", "Overcast Hillside.tbsky", "Pisa Courtyard.tbsky", "Smashed Windows.tbsky", "St Nicholas Church.tbsky", "Tokyo Takeshita.tbsky", "Uffizi Gallery.tbsky"], menu_labels: ["Berlin Underpass", "Bolongo Portico", "Canada Glacier", "Castle Sunset", "Desert Road", "Ennis House", "Evening Clouds", "Evening Construction", "Forest Path", "Garage", "Grace Cathedral", "Hedge Row", "Indoor Fluorescents", "Iowa Sunset", "Lands End", "Late Day Field", "Mountain Sunset", "Museum", "Narita Plaza", "Overcast Hillside", "Pisa Courtyard", "Smashed Windows", "St Nicholas Church", "Tokyo Takeshita", "Ufizzi Gallery"], default_value: 11, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bCustomSkyLight == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "sCustomSkyLight", label: "Custom", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bCustomSkyLight == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "sMarmosetInstall", label: "Marmoset", num_components: 1, default_value: ["C:\\Program Files\\Marmoset\\Toolbag 3\\toolbag.exe"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DRIVER/Labs/labs::marmoset_export',_hnt_DRIVER_labs__marmoset_export)
    return _hnt_DRIVER_labs__marmoset_export
}
        