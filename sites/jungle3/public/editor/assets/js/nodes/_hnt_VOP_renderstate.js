
export default function (hou) {
    class _hnt_VOP_renderstate extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/renderstate';
        static category = '/VOP';
        static houdiniType = 'renderstate';
        static title = 'Render State';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_renderstate.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "signature", label: "Signature", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_isparm": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "var", label: "Value Name", num_components: 1, default_value: ["object:name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["renderer:version", "renderer:shadingfactor", "renderer:rayshadingfactor", "renderer:raybias", "renderer:verbose", "renderer:threadcount", "renderer:renderengine", "renderer:hidden", "renderer:colorspace", "renderer:raylimiteval", "renderer:raylimitcomponents", "renderer:raylimitlightmask", "renderer:rayderivbias", "image:filename", "image:device", "image:resolution", "image:pixelaspect", "image:crop", "image:window", "image:samples", "image:jitter", "image:subpixel", "image:opacitythresh", "image:opacitylimit", "image:colorlimit", "image:background", "image:bgscale", "image:saveoptions", "camera:shutter", "photon:photongfile", "photon:photoncfile", "photon:photoncount", "shader:name", "object:name", "object:id", "object:shadingquality", "object:rayshadingquality", "object:displacebound", "object:reflectlimit", "object:refractlimit", "object:diffuselimit", "object:volumelimit", "object:rayweight", "object:pbrdiffusemask", "object:pbrglossymask", "object:pbrspecularmask", "object:motionfactor", "object:flatness", "object:reflectmask", "object:reflectcategories", "object:refractmask", "object:refractcategories", "object:lightmask", "object:lightcategories", "object:photonmodifier", "object:filter", "object:filterwidth", "object:dorayvariance", "object:variance", "object:globalquality", "object:diffusequality", "object:refractionquality", "object:reflectionquality", "object:minraysamples", "object:maxraysamples", "object:samplingquality", "object:velocityscale", "object:gifile", "object:gisample", "object:gierror", "object:smoothcolor", "object:phantom", "object:truedisplace", "object:rayshade", "object:volumeuniform", "object:volumeiso", "object:volumesteprate", "object:volumeshadowsteprate", "object:volumedensity", "object:volumesamples", "object:biasnormal", "object:area", "light:areamap", "light:areashape", "light:areasize", "light:arealight", "light:distantlight", "light:activeradius", "light:projection", "light:minraysamples", "light:maxraysamples", "light:zoom", "light:orthowidth", "light:shadowmask", "light:shadowcategories", "light:areafullsphere", "light:photontarget", "light:photonweight", "light:envangle"], menu_labels: ["Renderer: Version", "Renderer: Shading Factor", "Renderer: Ray Shading Factor", "Renderer: Ray Bias", "Renderer: Verbose", "Renderer: Thread Count", "Renderer: Render Engine", "Renderer: Hidden", "Renderer: Colorspace", "Renderer: Ray Limit Eval", "Renderer: Ray Limit Components", "Renderer: Ray Limit Light Mask", "Renderer: Ray Deriv Bias", "Image: Filename", "Image: Device", "Image: Resolution", "Image: Pixel Aspect", "Image: Crop", "Image: Window", "Image: Samples", "Image: Jitter", "Image: Sub-pixel", "Image: Opacity Threshold", "Image: Opacity Limit", "Image: Color Limit", "Image: Background", "Image: Background Scale", "Image: Save Options", "Camera: Shutter Times", "Photon: Global File", "Photon: Caustic File", "Photon: Count", "Shader: Name", "Object: Name", "Object: Id", "Object: Shading Quality", "Object: Ray Shading Quality", "Object: Displace Bound", "Object: Reflect Limit", "Object: Refract Limit", "Object: Diffuse Limit", "Object: Volume Limit", "Object: Ray Weight", "Object: PBR Diffuse Mask", "Object: PBR Glossy Mask", "Object: PBR Specular Mask", "Object: Motion Factor", "Object: Flatness", "Object: Reflection Mask", "Object: Reflection Categories", "Object: Refraction Mask", "Object: Refraction Categories", "Object: Light Mask", "Object: Light Categories", "Object: Photon Modifier", "Object: Volume Filter", "Object: Volume Filter Width", "Object: Do Ray Variance", "Object: Ray Variance", "Object: Global Quality", "Object: Diffuse Quality", "Object: Refraction Quality", "Object: Reflection Quality", "Object: Min Ray Samples", "Object: Max Ray Samples", "Object: Sampling Quality", "Object: Velocity Scale", "Object: Irradiance Cache File", "Object: Irradiance Samples", "Object: Irradiance Error", "Object: Smooth Grid Colors", "Object: Phantom", "Object: True Displacements", "Object: Ray-Traced Shading", "Object: Uniform Volume", "Object: Volume Isosurface", "Object: Volume Step Rate", "Object: Volume Shadow Step Rate", "Object: Volume Density", "Object: Volume Samples", "Object: Bias Along Normal", "Object: Surface Area", "Light: Area Map", "Light: Area Shape", "Light: Area Size", "Light: Is Area Light", "Light: Is Distant Light", "Light: Active Radius", "Light: Projection", "Light: Min Ray Samples", "Light: Max Ray Samples", "Light: Zoom", "Light: Orthowidth", "Light: Shadow Mask", "Light: Shadow Categories", "Light: Full Sphere Environment", "Light: Photon Target", "Light: Photon Weight", "Light: Sun Angle"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "default", label: "Default String", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "default_f", label: "Default Value", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "default_i", label: "Default Integer", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "default_v", label: "Default Vector", num_components: 3, default_value: [0, 0, 0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/renderstate',_hnt_VOP_renderstate)
    return _hnt_VOP_renderstate
}
        