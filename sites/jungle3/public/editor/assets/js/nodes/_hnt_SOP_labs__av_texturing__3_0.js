
export default function (hou) {
    class _hnt_SOP_labs__av_texturing__3_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/AliceVision/labs::av_texturing::3.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::av_texturing::3.0';
        static title = 'Labs AV Texturing';
        static icon = 'None';
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
			let hou_parm_template = new hou.ButtonParmTemplate({name: "cook", label: "Cook"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().cookNode(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().cookNode(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "manual_mode", label: "Manual Mode", default_value: true});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bExportLog", label: "Use Log", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Texturing", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.IntParmTemplate({name: "side", label: "Texture Side", num_components: 1, default_value: [8192], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["1024", "2048", "4096", "8192", "16384"], menu_labels: ["1024", "2048", "4096", "8192", "16384"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true});
			hou_parm_template2.setHelp("Output texture size.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "down", label: "Texture Downscale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["1", "2", "4", "8"], menu_labels: ["1", "2", "4", "8"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true});
			hou_parm_template2.setHelp("Texture downscale factor.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "file", label: "Texture File Type", num_components: 1, default_value: ["png"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["jpg", "png", "tiff", "exr"], menu_labels: ["jpg", "png", "tiff", "exr"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "unwrap", label: "Unwrap Method", num_components: 1, default_value: ["Basic"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["Basic", "LSCM", "ABF"], menu_labels: ["Basic", "LSCM", "ABF"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Method to unwrap input mesh if it does not have UV coordinates. \\n*Basic (> 600k faces): fast and simple. Can generate multiple atlases. \\n*LSCM (<= 600k faces): optimize space. Generates one atlas. \\n*ABF (<=300k faces): optimize space and stretch. Generates one atlas.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "holes", label: "Fill Holes", default_value: false});
			hou_parm_template2.setHelp("Fill texture holes with plausible values.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "flipN", label: "Flip Normals", default_value: false});
			hou_parm_template2.setHelp("Option to flip face normals. ");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useUDIM", label: "Use UDIM UVs", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1", label: "Advanced", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			let hou_parm_template3 = new hou.IntParmTemplate({name: "pad", label: "Padding", num_components: 1, default_value: [15], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setHelp("Texture edge padding size in pixels.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "score", label: "Best Score Threshold", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("Value of 0 disables filtering. Based on threshold to relative best score");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "angle", label: "Angle Hard Threshold", num_components: 1, default_value: [90], min: 0, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("Value of 0 disables filtering.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "force", label: "Force Visible By All Vertices", default_value: false});
			hou_parm_template3.setHelp("Triangle visibility is based on the union of vertices visibility.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "visRemap", label: "Visibility Remapping Method", num_components: 1, default_value: ["PullPush"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["Pull", "Push", "PullPush"], menu_labels: ["Pull", "Push", "PullPush"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setHelp("Method to remap visibilities from the reconstruction to the input mesh.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bCustomImages", label: "Use Custom Images for Texturing", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "customTextureImages", label: "Custom Texturing Images", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Directory, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCustomImages == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "correctEV", label: "Correct Exposure", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "useScore", label: "Use Score", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "processColorspace", label: "Process Colorspace", num_components: 1, default_value: ["sRGB"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["sRGB", "LAB", "XYZ"], menu_labels: ["sRGB", "LAB", "XYZ"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "multiBandDownscale", label: "Multi Band Downscale", num_components: 1, default_value: [4], min: 0, max: 8, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/AliceVision/labs::av_texturing::3.0',_hnt_SOP_labs__av_texturing__3_0)
    return _hnt_SOP_labs__av_texturing__3_0
}
        