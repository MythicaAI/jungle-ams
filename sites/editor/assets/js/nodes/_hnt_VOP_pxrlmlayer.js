
export default function (hou) {
    class _hnt_VOP_pxrlmlayer extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrlmlayer';
        static category = '/VOP';
        static houdiniType = 'pxrlmlayer';
        static title = 'PxrLM Layer';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrlmlayer.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.LabelParmTemplate({name: "lmlayer", label: "Overlay", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("PxrLMLayer can be connected in daisychain style by connect an optional layer here. Note that the upstream nodes are above/over this layer.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "layerMask", label: "Layer Mask", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("A (usually textured) mask to express where this layer's material is defined. Usually a layer should be considered a *complete* material and masks are use to mask where the material is present. Under some circumstances it might be useful to have a uniform mask but you should keep in mind to that the mask applies to all *enabled* material characteristics.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "diffuse", label: "Diffuse", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "diffuseBehavior", label: "Enabled", default_value: true});
			hou_parm_template2.setHelp("Selects the diffuse behavior for this layer. Enabled means that all the diffuse parameters are active. Disabled that the values of these parameters will not be included in the result.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuseColor", label: "Color", num_components: 3, default_value: [0.5, 0.5, 0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("The diffuse color is the amount of energy reflected back to the viewer in diffuse directions. Typically physically realistic diffuse responses are well below .5 and thus require higher-intensity lighting than might be required in old-school CGI setups. The diffuse color is often referred to as *albedo* in scientific literature.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuseRoughness", label: "Roughness", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the diffuse scattering model. Lambertian response is obtained by setting roughness to 0. Increasing roughness produces a flatter-look and is implemented via the Oren-Nayar model.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sheen", label: "Sheen", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Controls the diffuse retro-reflection effect. This can be used to simulate fuzz, velvet or carpet.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "incandescence", label: "Incandescence", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Controls the incandescence, or glow, of the material.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuseNn", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("You can specify a bump map for the exclusive use of the diffuse parameters.");
			hou_parm_template2.setTags({"script_ritype": "normal"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "diffuse_1", label: "Specular", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "specularBehavior", label: "Enabled", default_value: true});
			hou_parm_template2.setHelp("Selects the specular behavior for this layer. Enabled means that all the specular parameters are active. Disabled means that this layer asserts no opinion about the specular response - none of these parameters are considered.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularColor", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("A coloration for the specular highlights. Usually this should be set to white (1,1,1) but we provide it to push toward a non-physical look.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularRoughness", label: "Roughness", num_components: 1, default_value: [0.05], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the sharpness of highlights and reflections.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularEta", label: "Refractive Index", num_components: 3, default_value: [1.5, 1.5, 1.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Refractive Index is the dielectric index of refraction for the material. Channel values for this parameter typically lie in the range 1 - 3. Since we support 3 color values to capture the spectral effect presets may be prefered over color pickers.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specularKappa", label: "Extinction Coefficient", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Extinction Coefficient is a second refractive index for the material useful for characterizing metallic behaviors. Channel values for this parameter typically lie in the range 1 - 3. Since we support 3 color values to capture the spectral effect presets may be prefered over color pickers. When 0, the material reacts as a dielectric (glass, clearcoat)> When non-zero, the material responds as a metal would.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "specular_advanced", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "specularNn", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setHelp("You can achieve some cool effects by controlling the bump for specular independently of the diffuse parameters. If no connection is made here, we use the diffuse bump.");
			hou_parm_template3.setTags({"script_ritype": "normal"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "specularAnisotropy", label: "Anisotropy", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("Controls the shape of the specular highlights and reflections. At 0 the shape is circular. Values from -1 to 1 produce the range of ellipses from fat to tall. The direction of anisotropy can also be controlled by your model texture parameters and by the Shading Tangent parameter.");
			hou_parm_template3.setTags({"script_ritype": "float"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "specularTn", label: "Shading Tangent", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setHelp("Controls the anisotropy direction. Only valid when provided as a texture/connection.");
			hou_parm_template3.setTags({"script_ritype": "vector"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "diffuse_2", label: "Clear Coat", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "clearcoatBehavior", label: "Enabled", default_value: false});
			hou_parm_template2.setHelp("Selects the clearcoat behavior for this layer. Enabled means that all the clearcoat parameters are active. Disabled means that this layer asserts no opinion about the clearcoat - none of these parameters contribute to this layer.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatColor", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("The clearcoat is a dielectric material, so does not exhibit colored highlights and reflections. The clearcoat color does obscure the underlying material according to the transmission and thickness parameters.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatEta", label: "Refractive Index", num_components: 1, default_value: [1.3], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Since clearcoat is a dieletric, we provide a single index of refraction to control the reflection response. Typical values for eta might be in the same range as for glass: 1.5-1.8.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clearcoatRoughness", label: "Roughness", num_components: 1, default_value: [0.01], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the sharpness of the clearcoat highlights and reflections.");
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
			hou_parm_template2 = new hou.FolderParmTemplate({name: "clear_coat_advanced", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clearcoatNn", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setHelp("You can achieve some cool effects by controlling the bump for clearcoat independently of the specular and diffuse parameters. Generally a clearcoat is smoother than the underlying materials since it is used to fill in the cracks. Clearcoats can also be scratched or scuffed.");
			hou_parm_template3.setTags({"script_ritype": "normal"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clearcoatAnisotropy", label: "Anisotropy", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("Usually clearcoats exibit isotropic highlights and reflections. As with specular you can control the the clearcoat's anisotropic behavior through the combination of this parameter (-1 or 1 is highly anistropic) and Shading Tangent.");
			hou_parm_template3.setTags({"script_ritype": "float"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clearcoatTn", label: "Shading Tangent", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setHelp("Controls the anisotropy direction. Only valid when provided as a texture/connection.");
			hou_parm_template3.setTags({"script_ritype": "vector"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrlmlayer',_hnt_VOP_pxrlmlayer)
    return _hnt_VOP_pxrlmlayer
}
        