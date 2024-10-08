
export default function (hou) {
    class _hnt_VOP_pxrvolume extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrvolume';
        static category = '/VOP';
        static houdiniType = 'pxrvolume';
        static title = 'Pxr Volume';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrvolume.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "diffuseColor", label: "Diffuse Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("The color of the volume. The default value is white.");
			hou_parm_template.setTags({"ogl_diff": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "emitColor", label: "Emit Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("The emissive color of the volume. The default value is black (the volume will not emit light).");
			hou_parm_template.setTags({"ogl_emit": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "multiScatter", label: "Multiple Scattering", default_value: false});
			hou_parm_template.setHelp("If set to 0, and the integrator respects this hint, PxrVolume will only perform single scattering: points inside the volume will only be lit directly by light sources. If set to 1, points inside the volume will be lit by indirect illumination as well (light will scatter more than once inside the volume). This effect can be expensive and so defaults to 0 (off). Note that some integrators (e.g. PxrVCM, PxrUPBP) ignore this hint and always perform multiple scattering.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "velocity", label: "Velocity", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("The velocity of the volume. Any non-zero value here (or a connection) will result in a heterogeneous volume.");
			hou_parm_template.setTags({"script_ritype": "vector"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "velocityMultiplier", label: "VelocityMultiplier", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Multiplier on the velocity of the volume. This could be useful to convert between velocity defined per frame versus velocity defined per second.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "density_group", label: "Density", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "densityFloatPrimVar", label: "Density Float PrimVar", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("A primvar from the geometry which controls the density of the volume, unset by default. Setting this overrides the densityFloat input, and is more efficient than simply using a PxrPrimVar pattern connected to the densityFloat input.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "densityFloat", label: "Density Float", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ densityFloatPrimVar != \\\"\\\" }");
			hou_parm_template2.setHelp("The density of the volume directly controls how light is attenuated by the volume - i.e. it directly affects how the volume casts shadows. Unless you require colored shadows, you should prefer to set this parameter rather than the density color parameter.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "densityColorPrimVar", label: "Density Color PrimVar", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("A primvar from the geometry which controls the density of the volume, unset by default. Setting this overrides the densityColor input, and is more efficient than simply using a PxrPrimVar pattern connected to the densityColor input.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "densityColor", label: "Density Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ densityColorPrimVar != \\\"\\\" }");
			hou_parm_template2.setHelp("The density of the volume, which directly controls how light is attenuated by the volume - i.e. it directly affects how the volume casts shadows. If you do not need colored shadows from the volume, then you should set the density float parameter and leave the density color parameter untouched; the volume will render more efficiently.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "maxDensity", label: "Max Density", num_components: 1, default_value: [null], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("The max density parameter is only used by heterogeneous volumes and controls the step size used to sample the volume. For correctly unbiased rendering, the max density must be higher than any density encountered inside the volume. A high value of max density will result in slower renders since more steps will be taken to sample the volume. Setting the max density too small will speed up your render, but will also lead to incorrect rendering as dense regions of the volume will be undersampled. The default value of max density is -1.0, which means RenderMan will ignore this value and generate unbiased renders.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "density_group_1", label: "Anisotropy", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "anisotropy", label: "Primary Anisotropy", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the direction in which volume scatters light in the primary lobe. Anisotropy has a range of ``-1`` to ``1`` and the default is ``0`` (isotropic). A value of ``0`` for ``anisotropy`` means the volume is isotropic: light is scattered in all directions with equal probability. A value greater than ``0`` means the volume is forward scattering: incoming light has a higher chance of being scattered in the same direction (i.e. away from the incoming light). A value of anisotropy less than ``0`` means the volume is backwards scattering: incoming light has a higher chance of being scattered in the reverse direction (i.e. back towards the direction of incoming light).");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "anisotropy2", label: "Secondary Anisotropy", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls the direction in which volume scatters light in the secondary lobe. Anisotropy has a range of ``-1`` to ``1`` and the default is ``0`` (isotropic). A value of ``0`` for ``anisotropy`` means the volume is isotropic: light is scattered in all directions with equal probability. A value greater than ``0`` means the volume is forward scattering: incoming light has a higher chance of being scattered in the same direction (i.e. away from the incoming light). A value of anisotropy less than ``0`` means the volume is backwards scattering: incoming light has a higher chance of being scattered in the reverse direction (i.e. back towards the direction of incoming light).");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "blendFactor", label: "Lobe Blend Factor", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Controls blending weight between the two lobes. Value of ``0`` means only the first lobe is active and value of ``1`` means only the second lobe is active. Values in between means both lobes are active.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "density_group_2", label: "Sampling", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "equiangularWeight", label: "Equiangular weight", num_components: 1, default_value: [0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("The probability of equiangular sampling being used instead of density sampling. Equiangular sampling improves the convergence of volumes close to light sources, while density sampling can be a better technique when dealing with volumes with dense or highly varying density. The default value of 0.5 means both techniques will be used equally and combined with multiple importance sampling. If the volumes are dense and far away with light sources then decreasing the equiangular weight may result in better convergence.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "samples", label: "samples", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Controls the number of samples to take inside the volume per ray. The default is 4.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "stepSize", label: "Step Size", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Sets step size for ray marching in heterogeneous volume. Setting this parameter to low value may cause huge computational overhead, on the other settings this parameter to large value will change appearance of the volume in the wrong way. Only used when rendering with the PxrUPBP integrator.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "density_group_3", label: "MultiScatter Optimization", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "multiScatterOpt", label: "MultiScatter Optimization", default_value: false});
			hou_parm_template2.setHelp("Controls whether MultiScatter Optimization is applied or not.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "extinctionMultiplier", label: "Extinction Multiplier", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Extinction multiplier is used in multiscatter as a way to modify the extinction coefficients for multiple scattering events. Extinction multiplier can be set to any value above 0, and the default is ``1`` which means no modifications. A value below ``1`` decreases extinction coeffients while a value above ``1`` increases extinction coeffients.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "contributionMultiplier", label: "Contribution Multiplier", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Contribution multiplier is used in multiscatter as a way to modify contribution from direct lighting for multiple scattering events. Contribution multiplier can be set to any value above 0, and the default is ``1`` which means no modifications. A value below ``1`` decreases contribution from direct lighting while a value above ``1`` boosts contribution from direct lighting.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrvolume',_hnt_VOP_pxrvolume)
    return _hnt_VOP_pxrvolume
}
        