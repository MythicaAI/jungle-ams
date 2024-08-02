
export default function (hou) {
    class _hnt_VOP_pxrtexture extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrtexture';
        static category = '/VOP';
        static houdiniType = 'pxrtexture';
        static title = 'Pxr Texture';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrtexture.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "filename", label: "Filename", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setHelp("The filename for your texture. If you have used Mari, Mudbox, or ZBrush to create a tile-based series of textures, put _MAPID_ in the filename in the location where the renderer must dynamically figure out what texture to load based on the UV coordinates. For example, if your textures are from Mari and have names of /path/to/my/diffuseTexture.1001.exr and /path/to/my/diffuseTexture.1002.exr, the path you should specify should be /path/to/my/diffuseTexture._MAPID_.exr. Based on your selection for the Atlas Style parameter, RenderMan will replace _MAPID_ with the proper index. If you specify a filename and it can't be found, or if you don't specify one at all, the Missing Color and Missing Alpha parameters will be used instead of the texture color.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "firstChannel", label: "First Channel Offset", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Offsets the first channel to be looked up. Usually, you want to start with channel 0 (RGB of RGBA texture), but if you are using a multi-channel openexr texture, you may need to point to the correct channel. Let's say we have a texture containing 9 channels organised in 3 RGB groups (diff.r, diff,g, diff.b, spec.r, spec.g, spec.b, ior.r, ior.g, ior.b). If you want to read the 'spec' RGB channels, you will have to set firstChannel to 3.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "atlasStyle", label: "Atlas Style", menu_items: ["0", "1", "2", "3"], menu_labels: ["None", "UDIM (Mari)", "UV Tile Base-1 (Mudbox)", "UV Tile Base-0 (Zbrush)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("If you have created a series of tiled texturs using Mari, Mudbox, or ZBrush, select the type of atlas that should be used to determine the proper filename based on the UVs of your geometry. See the help text for the Filename parameter for more details on how you must specify your filename in these cases.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invertT", label: "Invert T", default_value: true});
			hou_parm_template.setHelp("Unlike RenderMan, Maya's UV have the T value inverted. For the models created in Maya, Invert T needs to be ON so that the texture orientation will be correct in the render.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "filter", label: "Filter", menu_items: ["0", "1", "2", "3", "4", "5", "6", "7"], menu_labels: ["Nearest", "Box", "Bilinear", "Bspline", "Mitchell", "Catmullrom", "Gaussian", "Lagrangian"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Choose the filter to apply to the texture as it is applied to the object.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "blur", label: "Blur", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Choose the width of the filter kernel as it is applied to the texture during lookup. Selecting 0.0 disables the filtering. Disabling the filter will speed up lookup and then cause your render to rely on the mip levels and the path tracing algorithm for averaging.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "lerp", label: "Mip Interpolate", default_value: true});
			hou_parm_template.setHelp("Selects whether to interpolate between adjacent resolutions in the multi-resolution texture, resulting in smoother transitions between levels.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "missingColor", label: "Missing Color", num_components: 3, default_value: [1, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("If you have wired resultRGB to another node in your network, and if there is an error in loading the file, the resultRGB value will be populated with the value that you specify here. RenderMan can fail to load a file for several reasons, including if the filename is incorrect, or if an atlas texture is specifid, but no _MAPID_ was found in the filename.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "missingAlpha", label: "Missing Alpha", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("If you have wired resultA to another node in your network, and if there is an error in loading the file, the resultA value will be populated with the value that you specify here. See the help for missingColor for the different cases for which RenderMan may have issues loading a file.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "linearize", label: "Linearize", default_value: false});
			hou_parm_template.setHelp("Apply the reverse sRGB transform your texture. If you are painting textures in sRGB space (default for most paint packages) but viewing your data in data linear space, your textures will look washed out. This will apply the sRGB transform to your texture, which should make it appear visually linear again.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "manifold", label: "Manifold", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("If you wish to tile your texture, rotate it, apply offsets, or use a different set of primvars to use as the texture coordinate lookup, create + wire in a PxrManifold2D pattern node into this parameter.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrtexture',_hnt_VOP_pxrtexture)
    return _hnt_VOP_pxrtexture
}
        