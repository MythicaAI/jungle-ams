
export default function (hou) {
    class _hnt_VOP_pxrlmglass extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrlmglass';
        static category = '/VOP';
        static houdiniType = 'pxrlmglass';
        static title = 'PxrLM Glass';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrlmglass.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.LabelParmTemplate({name: "lmlayer", label: "Overlay", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Connect a PxrLMLayer or PxrLMMixer node here to apply one or more layers atop the glass substrate.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "thin", label: "Thin", default_value: false});
			hou_parm_template.setHelp("Enabling Thin effectively eliminates the bending of light as it travels through the glass. When set, the absorption effect is disabled and colored shadows are enabled. While light bending is disabled, the eta parameter still governs the reflectivity of the surface.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "eta", label: "Refractive Index", num_components: 1, default_value: [1.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Refractive Index is the index of refraction and represents a physical property of a material. Smaller values (relative to the outside medium) bend light less. Reasonable values for glass are in the range 1.47 - 1.95.");
			hou_parm_template.setTags({"ogl_ior": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "reflectionColor", label: "Reflection Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Tints the reflected light.");
			hou_parm_template.setTags({"ogl_spec": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "refractionColor", label: "Refraction Color", num_components: 3, default_value: [0.8, 0.8, 0.8], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Tints the refracted light. This effect occurs at the surface and so you can connect textures to this parameter. Shadows for thin surfaces are filtered by the refraction color.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "roughness", label: "Roughness", num_components: 1, default_value: [0.01], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the roughness of the glass refractions. Larger values produce more blurred highlights. Smaller values produce tighter highlights.");
			hou_parm_template.setTags({"ogl_rough": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "absorption", label: "Absorption", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the volumetric absorption of glass. This control is ignored when rendering as thin glass. Since absorption is a property of the volume, it can't be textured over the surface. Absorption is determined by the thickness of the material. It's acceptble to select values outside of the [0, 1] range.");
			hou_parm_template.setTags({"ogl_alpha": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "transmissionColor", label: "Transmission Color", num_components: 3, default_value: [0.5, 0.5, 0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("The color of light transmitted through solid glass. Only has an effect when absorption is greater than 0 and when not thin. Since transmissionColor is a property of the volume, it can't be textured over the surface. Generally channel values should be less than 1.0, otherwise there will be no absorption at any distance.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "shadows", label: "Shadows", menu_items: ["0", "1"], menu_labels: ["Default", "Thin"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Select a shadowing behavior. When set to Thin, we ignore refractive bending effects for direct lighting. This, coupled with refraction color and absorption effects produce physically inaccurate but often aceptable shadowing. When set to Default, we defer to the primary Thin parameter to make this selection. The primary use for this parameter is to request thin shadows for a solid glass object.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bumpNormal", label: "Bump", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("Connect a PxrBump node here if you need bump or normal-mapped normals. Note that layers can override this value as well as apply independent bump to the specular or clearcoat channels.");
			hou_parm_template.setTags({"script_ritype": "normal"});
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
    hou.registerType('VOP/Other/pxrlmglass',_hnt_VOP_pxrlmglass)
    return _hnt_VOP_pxrlmglass
}
        