
export default function (hou) {
    class _hnt_VOP_usduvtexture__2_0 extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/usduvtexture::2.0';
        static category = '/VOP';
        static houdiniType = 'usduvtexture::2.0';
        static title = 'USD UV Texture';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_usduvtexture__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "file", label: "File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setHelp("Path to the texture");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "asset"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "st", label: "Texture Coordinate", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Texture coordinate to use to fetch this texture.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "wrapS", label: "Wrap S", num_components: 1, default_value: ["useMetadata"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["black", "clamp", "repeat", "mirror", "useMetadata"], menu_labels: ["Black", "Clamp", "Repeat", "Mirror", "Use Texture Metadata"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Wrap mode for S direction when reading this texture.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "token"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "wrapT", label: "Wrap T", num_components: 1, default_value: ["useMetadata"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["black", "clamp", "repeat", "mirror", "useMetadata"], menu_labels: ["Black", "Clamp", "Repeat", "Mirror", "Use Texture Metadata"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Wrap mode for T direction when reading this texture.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "token"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fallback", label: "Fallback Color", num_components: 4, default_value: [0, 0, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Fallback value used when texture can not be read.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float4"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "scale", label: "Scale", num_components: 4, default_value: [1, 1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Scale to be applied to all components of the texture.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float4"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bias", label: "Bias", num_components: 4, default_value: [0, 0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Bias to be applied to all components of the texture.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float4"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "sourceColorSpace", label: "Source Color Space", num_components: 1, default_value: ["auto"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["raw", "sRGB", "auto"], menu_labels: ["Raw", "sRGB", "Auto"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Flag indicating the color space in which the source texture is encoded.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "token"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/usduvtexture::2.0',_hnt_VOP_usduvtexture__2_0)
    return _hnt_VOP_usduvtexture__2_0
}
        