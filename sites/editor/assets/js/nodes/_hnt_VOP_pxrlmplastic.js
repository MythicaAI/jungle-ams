
export default function (hou) {
    class _hnt_VOP_pxrlmplastic extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrlmplastic';
        static category = '/VOP';
        static houdiniType = 'pxrlmplastic';
        static title = 'PxrLM Plastic';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrlmplastic.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.LabelParmTemplate({name: "lmlayer", label: "Overlay", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Connect a PxrLMLayer or PxrLMMixer node here to apply one or more layers atop the plastic substrate.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "diffuse", label: "Diffuse", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuseColor", label: "Color", num_components: 3, default_value: [0.4, 0.4, 0.4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("The color of the diffuse material. Sometimes referred to as albedo. To be physically plausible, the diffuse and specular colors should sum to less than 1. Materials should be brightened with light, not material response.");
			hou_parm_template2.setTags({"ogl_diff": "1", "script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuseRoughness", label: "Roughness", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the diffuse roughness of the material. A value of 0 represents classic Lambertian shading model. Non-zero values increase the microfacet roughness as proscribed by the Oren-Nayar shading model.");
			hou_parm_template2.setTags({"ogl_rough": "1", "script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "translucence", label: "Translucence", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the amount of light diffusely transmitted across the surface. This effect is usually applied to thin, leaf-like, objects. When non-zero, the shadows of your object are colored by diffuseColor.");
			hou_parm_template2.setTags({"ogl_transparency": "1", "script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sheen", label: "Sheen", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Controls the diffuse retro-reflection effect. This can be used to simulate fuzz, velvet or carpet.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "incandescence", label: "Incandescence", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Controls the incandescence, or glow, of the material.");
			hou_parm_template2.setTags({"ogl_emit": "1", "script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuseNn", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("Connect a PxrBump node here if you need bump or normal-mapped normals. Note that layers can override this value as well as apply independent bump to the specular or clearcoat channels.");
			hou_parm_template2.setTags({"script_ritype": "normal"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "diffuse_1", label: "Specular", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularColor", label: "Color", num_components: 3, default_value: [0.6, 0.6, 0.6], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("The specular reflectivity of the plastic. To be physically plausible, the diffuse and specular colors should sum to less than 1. Materials should be brightened with light, not material response.");
			hou_parm_template2.setTags({"ogl_spec": "1", "script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularRoughness", label: "Roughness", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the specular roughness of the material.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularAnisotropy", label: "Anisotropy", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the shape of the specular highlights and reflections. At 0 the shape is circular. Values from -1 to 1 produce the range of ellipses from fat to tall. The direction of anisotropy can also be controlled by your model texture parameters and by the Shading Tangent parameter.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularEta", label: "Refractive Index", num_components: 3, default_value: [1.5, 1.5, 1.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Refractive is the dielectric index of refraction for the material. For dielectric materials like plastic, changing this value primary affects the amount reflectivity as the light or camera positions relates to the surface normal. Channel values for this parameter typically lie in the range 1 - 3. Since we support 3 color values to capture the spectral effect presets may be prefered over color pickers.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularNn", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("Connect a PxrBump node here if you need bump or normal-mapped normals for your specular. Note that layers can override this value as well as apply independent bump to the specular or clearcoat channels.");
			hou_parm_template2.setTags({"script_ritype": "normal"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularTn", label: "Shading Tangent", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("Controls the anisotropy direction. Only valid when provided as a texture/connection.");
			hou_parm_template2.setTags({"script_ritype": "vector"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "diffuse_2", label: "Clear Coat", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatColor", label: "Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("The clearcoat models a dielectric coating material, so does not exhibit colored highlights and reflections. The clearcoat color governs the amount of the clearcoat effect to apply. The default black color results in no clear coat.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatRoughness", label: "Roughness", num_components: 1, default_value: [0.01], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the sharpness of the clearcoat highlights and reflections.");
			hou_parm_template2.setTags({"ogl_coat_rough": "1", "script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatAnisotropy", label: "Anisotropy", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the shape of the specular highlights and reflections. At 0 the shape is circular. Values from -1 to 1 produce the range of ellipses from fat to tall. The direction of anisotropy can also be controlled by your model texture parameters and by the shadingTangent parameter.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatEta", label: "Refractive Index", num_components: 1, default_value: [1.3], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Since clearcoat is a dieletric, we provide a single index of refraction to control the reflection response. Typical values for eta might be in the same range as for glass: 1.5-1.8.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatThickness", label: "Thickness", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the thickness of the clearcoat, which affects how much the under-materials are affected by the clearcoat color.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatTransmission", label: "Transmission", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Controls the amount and color of light absorpted by the clearcoat. Interoperates with thickness to produce a variety of aging the coating effects.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatNn", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("Connect a PxrBump node here if you need bump or normal-mapped normals for your clearcoat. Note that layers can override this value as well as apply independent bump to the specular or clearcoat channels.");
			hou_parm_template2.setTags({"script_ritype": "normal"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatTn", label: "Shading Tangent", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("Controls the anisotropy direction. Only valid when provided as a texture/connection.");
			hou_parm_template2.setTags({"script_ritype": "vector"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "presence", label: "Presence", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Connect a mask function here to apply a cutout pattern to your object. Presence is defined as a binary (0 or 1) function that can take on continuous values to antialias the shape. Useful for modeling leaves and other thin, complex shapes.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "inputAOV", label: "Input AOV", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Plug here a MatteID node to populate its associated AOV channel for objects associated with this shading instance.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "sampleLightEmission", label: "Sample Light Emission", default_value: false});
			hou_parm_template.setHelp("If this shader is associated with an area light source checking this box will trigger the extra computation to make the light emission visible to camera rays. This parameter has no effect if the light is not visible or if there is no light shader associated with the object.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrlmplastic',_hnt_VOP_pxrlmplastic)
    return _hnt_VOP_pxrlmplastic
}
        