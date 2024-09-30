
export default function (hou) {
    class _hnt_VOP_pxrskin extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrskin';
        static category = '/VOP';
        static houdiniType = 'pxrskin';
        static title = 'Pxr Skin';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrskin.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "nearColor", label: "nearColor", num_components: 3, default_value: [1, 0.9, 0.75], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Diffuse color for short-range subsurface scattering. (Short-range surface albedo is the product of nearColor and nearWeight). The default value is representative for pale caucasian skin.");
			hou_parm_template.setTags({"ogl_spec": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "midColor", label: "midColor", num_components: 3, default_value: [0.95, 0.7, 0.55], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Diffuse color for mid-range subsurface scattering. The default value is representative for pale caucasian skin.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "farColor", label: "farColor", num_components: 3, default_value: [0.7, 0.1, 0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Diffuse color for far-range subsurface scattering. The default value is representative for pale caucasian skin.");
			hou_parm_template.setTags({"ogl_diff": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "nearWeight", label: "nearWeight", num_components: 1, default_value: [0.4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Multiplier on nearColor (albedo = color * weight).");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "midWeight", label: "midWeight", num_components: 1, default_value: [0.3], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Multiplier on midColor.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "farWeight", label: "farWeight", num_components: 1, default_value: [0.9], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Multiplier on farColor. (The three weights do not have to add up to 1.0)");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "nearLength", label: "nearLength", num_components: 1, default_value: [0.8], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Diffuse mean free path length for the short-range subsurface scattering. Determines how far the light is scattered inside an object and how smooth the subsurface scattering is. Diffuse mean free path lengths are usually measured in millimeters (but see the discussion under the unitLength parameter).");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "midLength", label: "midLength", num_components: 1, default_value: [2.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Diffuse mean free path length for the mid-range subsurface scattering.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "farLength", label: "farLength", num_components: 1, default_value: [5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Diffuse mean free path length for the far-range subsurface scattering.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "unitLength", label: "unitLength", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("A multiplier on the nearLength, midLength, and farLength parameters (diffuse mean free path lengths). The lengths are often measured in millimeters. If the scene is modeled in some other scale, the unitLength should be set accordingly. The default value of 0.1 is appropriate for scenes modeled in centimeters and diffuse mean free path lengths measured in millimeters.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "specular", label: "specular", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The amount of specular reflection. The default value of 0.5 is reasonable for skin under normal conditions. Higher values are needed for wet, sweaty, or greasy skin; lower values can be used for skin covered with e.g. make-up powder.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "roughness", label: "roughness", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Surface roughness determines the width of the specular reflection. Larger values cause wider specular reflections.");
			hou_parm_template.setTags({"ogl_rough": "1", "script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "indirectAtSss", label: "indirectAtSss", default_value: false});
			hou_parm_template.setHelp("Compute indirect illumination at subsurface illumination samples. When 1 (on), indirect illumination can be the source of subsurface scattering. This effect is often subtle and due to its extra cost defaults to 0 (off).");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "sssOnBothSides", label: "sssOnBothSides", default_value: false});
			hou_parm_template.setHelp("Compute subsurface scattering (and glossy reflection) on both sides of surfaces. This enables subsurface scattering on backsides of non-closed objects, but can also cause more noise. Default is 0 (off).");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bumpNormal", label: "bumpNormal", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("An optional connection point for bumped normals.");
			hou_parm_template.setTags({"script_ritype": "normal"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "inputAOV", label: "Input AOV", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Plug here a MatteID node.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "continuationRays", label: "continuationRays", default_value: false});
			hou_parm_template.setHelp("Trace subsurface continuation rays. When 1 (on), subsurface scattering can be scattering from across surface creases and also from other nearby objects. But internal blockers (such as bone within a finger) are ignored. When 0 (off), internal blockers are taken into account but there is no subsurface scattering across surface creases or from other objects. Turning subsurface continuation rays on can increase noise or render time. The default is 0 (off).");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "followTopology", label: "followTopology", default_value: false});
			hou_parm_template.setHelp("Take local surface orientation into account when computing subsurface scattering: reduce subsurface scattering in locally concave regions such as wrinkles, skin pores, and between lips. Valid values are between 0.0 and 1.0. Default is 0.0 (no reduction).");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrskin',_hnt_VOP_pxrskin)
    return _hnt_VOP_pxrskin
}
        