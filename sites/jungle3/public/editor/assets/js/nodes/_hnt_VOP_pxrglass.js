
export default function (hou) {
    class _hnt_VOP_pxrglass extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrglass';
        static category = '/VOP';
        static houdiniType = 'pxrglass';
        static title = 'Pxr Glass';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrglass.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "ior", label: "ior", num_components: 1, default_value: [1.5], min: 1, max: 4, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The index of refraction is a physical property of a material. Smaller values (relative to the medium) bend light less. Reasonable values for IOR for glass are in the range 1.47 - 1.95.");
			hou_parm_template.setTags({"ogl_ior": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "roughness", label: "roughness", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Controls the roughness of the material. Larger values produce more blurred highlights. Smaller values product tighter highlights.");
			hou_parm_template.setTags({"ogl_rough": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "reflectionColor", label: "reflectionColor", num_components: 3, default_value: [0.5, 0.5, 0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Tints the reflected light.");
			hou_parm_template.setTags({"ogl_spec": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "reflectionGain", label: "reflectionGain", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("A multiplier for reflectionColor.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "transmissionColor", label: "transmissionColor", num_components: 3, default_value: [0.8, 0.8, 0.8], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Tints the refracted light. Note that transmission color (and gain) are surface effects while the absorption is volumetric. In other words, the effects of transmission color aren't dependendent on the thickness of the glass.");
			hou_parm_template.setTags({"ogl_diff": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "transmissionGain", label: "transmissionGain", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("A multiplier for transmission color.");
			hou_parm_template.setTags({"ogl_transparency": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "absorptionGain", label: "absorptionGain", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("A non-zero value triggers computation of Beer's law, which calculates the absorption of light based on the distance through the material it travels. This value is multiplied by the absorptionColor. Since absorption is a physical property, aborptionGain can be (arbitrarily) greater than 1 and choosing a reasonable value will depend on modeling units.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "absorptionColor", label: "absorptionColor", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("This value is only relevant when aborptionGain is greater than 0. The absorptionColor is an inverse color: higher channel values are absorbed more. A visually blue material might have an absorptionColor of RGB:[1 1 .5].");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "lightSubset", label: "lightSubset", menu_items: ["0", "1", "2", "3"], menu_labels: ["Outside", "Inside", "Any Side", "None"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("For solid objects, we can reduce noise by assuming that direct light sources exist in a subset of potential locations. Usually Outside is the best setting. Choosing None disables the effect and cost of direct lighting computations and may be useful (faster) when an object is only illuminated through indirect light paths.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bumpNormal", label: "bumpNormal", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("An optional connection point for bumped normals.");
			hou_parm_template.setTags({"script_ritype": "normal"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrglass',_hnt_VOP_pxrglass)
    return _hnt_VOP_pxrglass
}
        