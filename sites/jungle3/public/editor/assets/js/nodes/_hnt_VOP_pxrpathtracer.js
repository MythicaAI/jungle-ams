
export default function (hou) {
    class _hnt_VOP_pxrpathtracer extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrpathtracer';
        static category = '/VOP';
        static houdiniType = 'pxrpathtracer';
        static title = 'Pxr Path Tracer';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrpathtracer.svg';
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
			let hou_parm_template = new hou.IntParmTemplate({name: "maxPathLength", label: "maxPathLength", num_components: 1, default_value: [10], min: 1, max: 20, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Controls the absolute upper bound on the maximum ray depth. A value of 1 for this parameter will allow direct illumination only, while a value of 4 will permit up to 3 bounces of global illumination. Default value is 10.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "maxContinuationLength", label: "maxContinuationLength", num_components: 1, default_value: [null], min: null, max: 32, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Similar to maxPathLength, this controls the upper bound on the maximum ray depth including continuation rays. Any negative value will cause the path tracer to use an empirical heuristic to bound the ray depth. A positive value will override this heuristic and cause the path tracer to use the parameter value directly as the maximum ray depth. Continuation rays are normally produced by volumes when no density exists within subsections of them. If there are many such zero density subsections overlapping then it is possible to quickly hit the maximum continuation depth quickly, resulting in black regions within your render.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "sampleMode", label: "sampleMode", num_components: 1, default_value: ["bxdf"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["manual", "bxdf"], menu_labels: ["manual", "bxdf"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Controls the strategy for how indirect ray counts are apportioned between diffuse vs. glossy vs. specular Bxdf lobes. Valid values for this parameter are: 'bxdf' or 'manual'. If 'sampleMode' is set to 'bxdf', then the Bxdf is responsible for balancing the number of indirect rays that will be spawned at each camera hit point between the diffuse vs. glossy vs. specular lobes, and the total number of indirect rays spawned at each camera hit point will be controlled by the numIndirectSamples parameter. If 'sampleMode' is set to 'manual' the user is responsible for explicitly specifying the number of indirect rays to spawn per Bxdf lobe at each camera hit point via the numDiffuseSamples, numSpecularSamples, numSubsurfaceSamples, and numRefractionSamples parameters. The default is 'bxdf'.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numLightSamples", label: "numLightSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Controls the number of light samples for direct illumination per camera hit point. The default is 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numBxdfSamples", label: "numBxdfSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Controls the number of Bxdf samples for direct illumination per camera hit point. The default is 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numIndirectSamples", label: "numIndirectSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sampleMode != bxdf }");
			hou_parm_template.setHelp("When sampleMode is set to Bxdf this parameter controls the total number of indirect rays to spawn per camera hit point. When sampleMode is set to manual the value of this parameter is ignored. The default is 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numDiffuseSamples", label: "numDiffuseSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sampleMode != manual }");
			hou_parm_template.setHelp("When sampleMode is set to manual, controls the number of indirect diffuse reflection rays to spawn per camera hit point. Ignored when sampleMode is set to Bxdf. The default is 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numSpecularSamples", label: "numSpecularSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sampleMode != manual }");
			hou_parm_template.setHelp("When sampleMode is set to manual, controls the number of indirect specular/glossy reflection rays to spawn per camera hit point. Ignored when sampleMode is set to Bxdf. The default is 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numSubsurfaceSamples", label: "numSubsurfaceSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sampleMode != manual }");
			hou_parm_template.setHelp("When sampleMode is set to manual, controls the number of subsurface rays to spawn per camera hit point. Ignored when sampleMode is set to Bxdf. The default is 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "numRefractionSamples", label: "numRefractionSamples", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sampleMode != manual }");
			hou_parm_template.setHelp("When sampleMode is set to manual, controls the number of refraction/transmission rays to spawn per camera hit point. Ignored when sampleMode is set to Bxdf. The default is 1.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "allowCaustics", label: "allowCaustics", default_value: false});
			hou_parm_template.setHelp("Controls whether illumination from caustic light paths (that is, specular illumination onto diffuse surfaces) is allowed or disallowed. The default is off.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "accumOpacity", label: "accumOpacity", default_value: false});
			hou_parm_template.setHelp("Controls whether or not the path tracer will keep track of accumulated opacity along the path. The default is off.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "russian_roulette", label: "Russian Roulette", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.IntParmTemplate({name: "rouletteDepth", label: "rouletteDepth", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("The path length at which the integrator will begin performing Russian roulette (a method of probabilistically terminating a ray path). Decreasing this setting will lead to shorter paths and faster renders, but will result in more noise.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "rouletteThreshold", label: "rouletteThreshold", num_components: 1, default_value: [0.2], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("The path throughput threshold below which Russian roulette is applied. It is usually preferable to apply Russian roulette only to paths of low importance in order to avoid noise. Increasing this setting will apply Russian roulette to more paths and thus increase the speed of the render, but will also increase noise.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "russian_roulette_1", label: "Indirect Clamping", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.IntParmTemplate({name: "clampDepth", label: "clampDepth", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("If a value for the clampLuminance parameter is specified, then clampDepth controls the ray depth at which to begin clamping based on the per-ray luminance. For example, setting this parameter to 2 and also specifying a value of 4 for clampLuminance will ensure that the luminance of each ray's contribution is no more than 4 for all indirect illumination, without affecting or clamping the direct illumination. The default is 2.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clampLuminance", label: "clampLuminance", num_components: 1, default_value: [10], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("By default the PxrPathTracer integrator clamps the luminance of each per-ray contribution to be at most 10.0. However, it is possible to change this behavior by specifying a different value for the clampLuminance parameter. Specifying a relatively low value for the clampLuminance parameter (for example, between 2 and 20) can greatly speed up convergence and, in many cases, will make PxrPathTracer converge more quickly than the more sophisticated PxrVCM integrator. In some cases, indirect illumination lights paths may be noticeably dimmer due to clamping; this may be an acceptable trade-off in certain cases. Setting this parameter to a very large number (such as 1e30) will effectively disable all clamping. The default is 10.0.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "russian_roulette_2", label: "Holdout", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "imagePlaneSubset", label: "imagePlaneSubset", num_components: 1, default_value: ["rman__imageplane"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Specify the trace subset for the image plane. The integrator will trace against this subset to get the color of the image plane. This is used for the holdout background. Note that this only applies to geometry that is assigned to an emissive Bxdf such as PxrConstant.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrpathtracer',_hnt_VOP_pxrpathtracer)
    return _hnt_VOP_pxrpathtracer
}
        