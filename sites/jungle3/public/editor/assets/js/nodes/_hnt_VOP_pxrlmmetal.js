
export default function (hou) {
    class _hnt_VOP_pxrlmmetal extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrlmmetal';
        static category = '/VOP';
        static houdiniType = 'pxrlmmetal';
        static title = 'PxrLM Metal';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrlmmetal.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.LabelParmTemplate({name: "lmlayer", label: "Overlay", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Connect a PxrLMLayer or PxrLMMixer node here to apply one or more layers atop the metal substrate.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "eta", label: "Refractive Index", num_components: 3, default_value: [4.36968, 2.91671, 1.6547], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Refractive Index is the dielectric index of refraction for the material. Channel values for this parameter typically lie in the range 1 - 3. Since we support 3 color values to capture the spectral effect presets may be prefered over color pickers.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "kappa", label: "Extinction Coefficient", num_components: 3, default_value: [5.20643, 4.23137, 3.75497], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Extinction Coefficient is a second refractive index for the material useful for characterizing metallic behaviors. Channel values for this parameter typically lie in the range 1 - 3. Since we support 3 color values to capture the spectral effect presets may be prefered over color pickers. When 0, the material reacts as a dielectric (glass, clearcoat)> When non-zero, the material responds as a conductor would.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "roughness", label: "Roughness", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the sharpness of highlights and reflections.");
			hou_parm_template.setTags({"ogl_rough": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "anisotropy", label: "Anisotropy", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the shape of the specular highlights and reflections. At 0 the shape is circular. Values from -1 to 1 produce the range of ellipses from fat to tall. The direction of anisotropy can also be controlled by your model texture parameters and by the Shading Tangent parameter.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "specularColor", label: "Specular Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Provides an additional coloration tint atop the reflection colors produced by the Fresnel Refractive Index and Extinction parameters. Usually its best to leave this value to its default white hue but use this parameter to control the strength of the reflections.");
			hou_parm_template.setTags({"ogl_spec": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bumpNormal", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("Connect a PxrBump node here if you need bump or normal-mapped normals. Note that layers can override this value as well as apply independent bump to the diffuse or clearcoat channels. Only valid when provided as a texture/connection.");
			hou_parm_template.setTags({"script_ritype": "normal"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "shadingTangent", label: "Shading Tangent", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("Controls the anisotropy direction. Only valid when provided as a texture/connection.");
			hou_parm_template.setTags({"script_ritype": "vector"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "presence", label: "Presence", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Connect a mask function here to apply a cutout pattern to your object. Presence is defined as a binary (0 or 1) function that can take on continuous values to antialias the shape. Useful for modeling leaves and other thin, complex shapes.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "inputAOV", label: "Input AOV", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Plug here a MatteID node.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrlmmetal',_hnt_VOP_pxrlmmetal)
    return _hnt_VOP_pxrlmmetal
}
        