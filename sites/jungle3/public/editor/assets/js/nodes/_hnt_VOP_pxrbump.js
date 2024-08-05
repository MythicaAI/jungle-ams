
export default function (hou) {
    class _hnt_VOP_pxrbump extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrbump';
        static category = '/VOP';
        static houdiniType = 'pxrbump';
        static title = 'Pxr Bump';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrbump.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "scale", label: "Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("An object-space scale applied to the bump.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "disable", label: "Disabled", default_value: false});
			hou_parm_template.setHelp("Use the geometric normal (ignore the modified bump).");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "pattern_group", label: "Pattern", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "inputBump", label: "Input Bump", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("If 'Input Bump' is connected (and 'Filename' is not specified), the pattern executes the upstream shader graph connected to 'Input Bump' 3 times, once at the shading point and once at P+du and P+dv. Then it crosses the results to get the bump normal. Note that if you have a fixed texture and UV, it is highly recommended to use 'Filename' method below because it is 3 times faster! If 'Filename' is specified below, 'Input Bump' is ignored.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "pattern_group_1", label: "Texture", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "filename", label: "Filename", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setHelp("Filename could be a color or monochrome file. The shader reads only one channel of the file from Channel specified below. If 'Filename' is specified, the pattern has no upstream graph connected. Instead it reads the bump value from the texture file. The bump pattern gets the derivatives from the texture AS it filters it, so it doesn't have to read texture values 3 times. As a result, however, it can only take the derivatives of a single channel, which is specificed by 'First Channel'. The shader currently does not allow modifying the manifold of the texture. If 'Input Bump' is connected and Filename is also specified, Filename is used while the connection of 'Input Bump' is ignored.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "firstChannel", label: "First Channel Offset", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ filename == \\\"\\\" }");
			hou_parm_template2.setHelp("First channel offset to be looked up for Filename.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "atlasStyle", label: "Atlas Style", menu_items: ["0", "1", "2", "3"], menu_labels: ["None", "UDIM (Mari)", "UV Tile Base-1 (Mudbox)", "UV Tile Base-0 (Zbrush)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ filename == \\\"\\\" }");
			hou_parm_template2.setHelp("Specify which atlas style.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "invertT", label: "Invert T", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ filename == \\\"\\\" }");
			hou_parm_template2.setHelp("Inverts the t texture coordinate for texture lookup.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "blur", label: "Blur", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ filename == \\\"\\\" }");
			hou_parm_template2.setHelp("Specifies how much to blur the result from the texture.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "lerp", label: "Mip Interpolate", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ filename == \\\"\\\" }");
			hou_parm_template2.setHelp("Selects whether to interpolate between adjacent resolutions in the multi-resolution texture, resulting in smoother transitions between levels.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.LabelParmTemplate({name: "manifold", label: "Bump Manifold", column_labels: [""]});
			hou_parm_template2.hide(true);
			hou_parm_template2.setHelp("You can connect a PxrBumpManifold2D here. Any other manifold type will be ignored.");
			hou_parm_template2.setTags({"script_ritype": "struct"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "pattern_group_2", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "inputN", label: "Input Normal", num_components: 3, default_value: [1, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("An additional normal to be added to the bump normal.");
			hou_parm_template2.setTags({"script_ritype": "normal"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "reverse", label: "Reverse Normal", default_value: false});
			hou_parm_template2.setHelp("Reverse the resulting normal.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "adjustAmount", label: "Adjust Amount", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Amount to adjust the normals when they are facing away from the camera.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "surfaceNormalMix", label: "Surface Normal Mix", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("The amount to mix the resulting normals with the surface normals.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrbump',_hnt_VOP_pxrbump)
    return _hnt_VOP_pxrbump
}
        