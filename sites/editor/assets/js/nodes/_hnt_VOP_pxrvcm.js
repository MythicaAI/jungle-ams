
export default function (hou) {
    class _hnt_VOP_pxrvcm extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrvcm';
        static category = '/VOP';
        static houdiniType = 'pxrvcm';
        static title = 'Pxr VCM';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrvcm.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "connectPaths", label: "connectPaths", default_value: true});
			hou_parm_template.setHelp("When turned on, bidirectional path tracing is enabled; otherwise, VCM will operate as a forward path tracer (if merging is also disabled). Recommended for most scenes, especially interior scenes with significant indirect illumination.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "mergePaths", label: "mergePaths", default_value: true});
			hou_parm_template.setHelp("Controls vertex merging, which improves the convergence of specular-diffuse-specular (caustic) lighting. Enabling vertex merging is generally recommended but may result in additional time and memory overhead for photons, and in scenes with little specular-diffuse-specular transport, may be unnecessary.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numLightSamples", label: "numLightSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The number of light samples taken when computing direct illumination. The default is ``1``.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numBxdfSamples", label: "numBxdfSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The number of bxdf samples taken when computing direct illumination. The default is ``1``.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "maxPathLength", label: "maxPathLength", num_components: 1, default_value: [10], min: 1, max: 20, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The maximum length of a combined light and eye path (including the connection). A value of ``4`` will permit up to 3 bounces of global illumination. A value of ``1`` for this parameter will allow direct illumination only. The default value of this parameter is 10.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "rouletteDepth", label: "rouletteDepth", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The path length at which the integrator will begin performing Russian roulette (a method of probabilistically terminating a ray path). Decreasing this setting will lead to shorter paths and faster renders, but will result in more noise.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "rouletteThreshold", label: "rouletteThreshold", num_components: 1, default_value: [0.2], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The path throughput threshold below which Russian roulette is applied. It is usually preferable to apply Russian roulette only to paths of low importance in order to avoid noise. Increasing this setting will apply Russian roulette to more paths and thus increase the speed of the render, but will also increase noise.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "clampDepth", label: "clampDepth", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("If a value for the clampLuminance parameter is specified, then clampDepth controls the ray depth at which to begin clamping based on the per-ray luminance. For example, setting this parameter to 2 and also specifying a value of 4 for clampLuminance will ensure that the luminance of each ray's contribution is no more than 4 for all indirect illumination, without affecting or clamping the direct illumination. The default is 2.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "clampLuminance", label: "clampLuminance", num_components: 1, default_value: [10], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("By default the PxrPathTracer integrator clamps the luminance of each per-ray contribution to be at most 10.0. However, it is possible to change this behavior by specifying a different value for the clampLuminance parameter. Specifying a relatively low value for the clampLuminance parameter (for example, between 2 and 20) can speed up convergence. In some cases, indirect illumination lights paths may be noticeably dimmer due to clamping; this may be an acceptable trade-off in certain cases. Setting this parameter to a very large number (such as 1e30) will effectively disable all clamping. The default is 10.0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "mergeRadius", label: "mergeRadius", num_components: 1, default_value: [5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Initial radius used in vertex merging. It is measured in screen space pixels (not world space). Increasing this radius will lead to increased blurring of the photons, which is helpful in reducing noisy caustics. However, this will also slow down merging, and will also require more iterations in order to arrive at a bias-free result. (This parameter was previously called 'mergeRadiusScale', and that name is still accepted.)");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "timeRadius", label: "timeRadius", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Specifies the maximum interval in time (as a fraction of the shutter) over which photons are merged. The default value of 1.0 may cause smearing for caustics involving moving objects. Decreasing the timeRadius will lead to more accurate results/decreased smearing for motion blurred caustics, at the cost of static objects requiring more photons in order to resolve caustics.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "photonGuiding", label: "photonGuiding", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Sets the probability of using photon guiding during photon emission. A value of 0.0 turns off photon guiding. A value between 0.0 and 1.0 will cause a combination of photon guiding and standard photon emission. Finally, a value of 1 means that only photon guiding will be used -- in that case photons will be emitted only towards the specified bounding box, which may result in rendering of biased images. The default value is 0.0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "photonGuidingBBoxMin", label: "photonGuidingBBoxMin", num_components: 3, default_value: [1e+30, 1e+30, 1e+30], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"script_ritype": "point"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "photonGuidingBBoxMax", label: "photonGuidingBBoxMax", num_components: 3, default_value: [null, null, null], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("These two parameters can be used to explicitly specify the bounding box (in world space coordinates) towards which more photons should be emitted. If this bounding box is not specified, it will be computed automatically as a (slightly loose) bounding box of the directly visible parts of the scene.");
			hou_parm_template.setTags({"script_ritype": "point"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "specularCurvatureFilter", label: "specularCurvatureFilter", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("This allows the user to de-activate specular roughness filtering. Specular roughness filtering usually yields renders with less noise, but this may result in inaccurate caustics. Set this value to 0.0f when you want to render ground-truth caustics. The default value is 1.0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrvcm',_hnt_VOP_pxrvcm)
    return _hnt_VOP_pxrvcm
}
        