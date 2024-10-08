
export default function (hou) {
    class _hnt_VOP_pxrbaketexture extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrbaketexture';
        static category = '/VOP';
        static houdiniType = 'pxrbaketexture';
        static title = 'Pxr Bake Texture';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrbaketexture.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "input", label: "Input", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "inputRGB", label: "Input Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Input color value");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "inputF", label: "Input Float", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Input float value");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "input_1", label: "Texture", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "filename", label: "Filename", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Input/output texture filename.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "atlasStyle", label: "Atlas Style", menu_items: ["0", "1", "2", "3"], menu_labels: ["None", "UDIM (Mari)", "UV Tile Base-1 (Mudbox)", "UV Tile Base-0 (Zbrush)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setHelp("Formating style for multi-tile (atlas) textures. Atlas filenames must contain '__MAPID__'.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "texture_additional", label: "Additional", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.MenuParmTemplate({name: "filter", label: "Filter", menu_items: ["0", "1", "2", "3", "4", "5", "6", "7"], menu_labels: ["Nearest", "Box", "Bilinear", "Bspline", "Mitchell", "Catmullrom", "Gaussian", "Lagrangian"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setHelp("Selects different reconstruction filters that can be used during texture lookup.");
			hou_parm_template3.setTags({"script_ritype": "int"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "lerp", label: "Mip Interpolate", default_value: true});
			hou_parm_template3.setHelp("Interpolate values between mipmap levels.");
			hou_parm_template3.setTags({"script_ritype": "int"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "invertT", label: "Invert T", default_value: true});
			hou_parm_template3.setHelp("Inverts the T parameter for the texture lookup.");
			hou_parm_template3.setTags({"script_ritype": "int"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "missingColor", label: "Missing Color", num_components: 3, default_value: [1, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template3.setHelp("Resulting color when there is an error opening the texture file.");
			hou_parm_template3.setTags({"script_ritype": "color"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "input_2", label: "Baking", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.MenuParmTemplate({name: "bakeMode", label: "Bake Mode", menu_items: ["0", "1"], menu_labels: ["Disabled", "Enabled"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setHelp("Enable or disable texture baking.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "renderMode", label: "Render Mode", menu_items: ["0", "1", "2"], menu_labels: ["Automatic", "Input", "Texture"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setHelp("Control reading from input pattern or baked texture. Automatic attempts to read baked texture first, then input pattern.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "display", label: "File Type", num_components: 1, default_value: ["texture"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["texture", "openexr", "tiff"], menu_labels: ["txmake (.tex)", "OpenEXR (.exr)", "TIFF (.tif)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Output file type display driver.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "displayFormat", label: "File Format", num_components: 1, default_value: ["openexr"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["openexr", "tiff"], menu_labels: ["OpenEXR", "TIFF"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ display != texture }");
			hou_parm_template2.setHelp("txmake (.tex) file format.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "displayType", label: "Data Type", num_components: 1, default_value: ["half"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["half", "float"], menu_labels: ["half", "float"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ display == tiff }");
			hou_parm_template2.setHelp("OpenEXR data type.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "displayCompression", label: "Compression", num_components: 1, default_value: ["zip"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "rle", "zip", "piz", "lossless", "lossy"], menu_labels: ["None", "RLE (OpenEXR)", "ZIP (OpenEXR)", "PIZ (OpenEXR)", "Lossless (TIFF)", "Lossy (TIFF)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("File format compression.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "resolutionX", label: "Resolution X", num_components: 1, default_value: [512], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Output resolution in X.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "resolutionY", label: "Resolution Y", num_components: 1, default_value: [512], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Output resolution in Y.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "primVar", label: "PrimVar ST/S", num_components: 1, default_value: ["st"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("2D or 1D primvar defining the texture manifold.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "primVar2", label: "PrimVar T", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Optional 1D primvar defining the texture manifold.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrbaketexture',_hnt_VOP_pxrbaketexture)
    return _hnt_VOP_pxrbaketexture
}
        