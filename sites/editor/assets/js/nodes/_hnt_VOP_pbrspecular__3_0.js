
export default function (hou) {
    class _hnt_VOP_pbrspecular__3_0 extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Shading/pbrspecular::3.0';
        static category = '/VOP';
        static houdiniType = 'pbrspecular::3.0';
        static title = 'PBR Specular';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "model", label: "Specular Model", menu_items: ["phong", "blinn", "cone", "ggx"], menu_labels: ["Phong", "Blinn", "Cone", "GGX"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "label", label: "Component Label", num_components: 1, default_value: ["reflect"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["diffuse", "specular", "reflect", "refract"], menu_labels: ["Diffuse", "Specular", "Reflect", "Refract"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "rough", label: "Roughness", num_components: 1, default_value: [0.1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "aniso", label: "Anisotropy", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ model == cone }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "anisodir", label: "Anisotropy Direction", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ model == cone }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "masking", label: "Masking", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ model != ggx }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fresblend", label: "Fresnel Blending", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "Fzero", label: "Reflectance", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "eta", label: "Eta", num_components: 1, default_value: [0.8], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "thinfilm", label: "Thin Film Refraction", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Shading/pbrspecular::3.0',_hnt_VOP_pbrspecular__3_0)
    return _hnt_VOP_pbrspecular__3_0
}
        