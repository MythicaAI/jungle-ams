
export default function (hou) {
    class _hnt_VOP_pxrlmdiffuse extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrlmdiffuse';
        static category = '/VOP';
        static houdiniType = 'pxrlmdiffuse';
        static title = 'PxrLM Diffuse';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrlmdiffuse.svg';
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
			hou_parm_template.setHelp("Connect a PxrLMLayer or PxrLMMixer node here to apply one or more layers atop the diffuse substrate.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "frontColor", label: "Front Color", num_components: 3, default_value: [0.5, 0.5, 0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("The color of the diffuse material as viewed from the outward normal facing side.");
			hou_parm_template.setTags({"ogl_diff": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "backColor", label: "Back Color", num_components: 3, default_value: [0.5, 0.5, 0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("The color of the diffuse material as viewed from the opposite normal facing side. If you have a correctly modeled solid object, this color should have no effect. But if you have a sheet of paper, it's convenient to write on both sides.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "roughness", label: "Diffuse Roughness", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the diffuse roughness of the material. A value of 0 represents classic Lambertian shading model. Non-zero values increase the microfacet roughness as proscribed by the Oren-Nayar shading model.");
			hou_parm_template.setTags({"ogl_rough": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "sheen", label: "Sheen", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Controls the amount and coloration of the sheen for your material. Sheen occurs as grazing angles and can be used to produce a cloth-like effect.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "translucence", label: "Translucence", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the amount of light diffusely transmitted across the surface. This effect is usually applied to thin, leaf-like, objects. When non-zero, the shadows of your object take on a combination of the front and back colors.");
			hou_parm_template.setTags({"ogl_transparency": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "incandescence", label: "Incandescence", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Controls the incandescence, or glow, of the material.");
			hou_parm_template.setTags({"ogl_emit": "1", "script_ritype": "color"});
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
    hou.registerType('VOP/Other/pxrlmdiffuse',_hnt_VOP_pxrlmdiffuse)
    return _hnt_VOP_pxrlmdiffuse
}
        