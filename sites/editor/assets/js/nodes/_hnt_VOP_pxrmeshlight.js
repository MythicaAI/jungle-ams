
export default function (hou) {
    class _hnt_VOP_pxrmeshlight extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrmeshlight';
        static category = '/VOP';
        static houdiniType = 'pxrmeshlight';
        static title = 'Pxr Mesh Light';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrmeshlight.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "basic", label: "Basic", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "intensity", label: "Intensity", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("intensity: Scales the contribution of this light linearly. The light intensity is computed using physical units.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "exposure", label: "Exposure", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("exposure: Specifies the exposure of the area light as a power of 2. Increasing the exposure by 1 will double the energy emitted by the light source. A value of 0 produces an intensity of 1 at the source, -1 produces 0.5. Real world lighting has high energies and typical exposures are low values while you may have to type a really large number for equivalent Intensity. This is also comfortable to artists familiar with photographic measurements.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "lightColor", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("lightColor: The color of the emitted light.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "textureColor", label: "Texture Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("textureColor: An image to use as a light source. Preferably a High Dynamic Range source. Notice this affects color and shadowing based on the contents of the HDRI used. If forced to use an 8-bit source such as a JPEG image, it should be linearized (transformed to linear color space) before use as a color. Since this is indeed a mesh, you must have defined UVs or appropriate projections to place your texture correctly.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "enableTemperature", label: "Enable Temperature", default_value: false});
			hou_parm_template2.setHelp("enableTemperature: Turns color temperature on or off.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "temperature", label: "Temperature", num_components: 1, default_value: [6500], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableTemperature != 1 }");
			hou_parm_template2.setHelp("temperature: Allow the user to choose the color temperature of the light in Kelvins. Unlike the basic light color, this allows the user to easily pick plausible light colors based on standard temperature measurements.This control will act like a filter or gel (a tinted transparent surface) in front of your light. If your light is white, you will get the chosen color temperature. If your light is colored, the color temperature will make it cooler (over 6500K) or warmer (below 6500K). The effect will be less pronounced on fully saturated mono-chromatic lights. Defaults to 6500K, which should be very close to white on most monitors (D65 illuminant used by sRGB and Rec 709).");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "basic_1", label: "Refine", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specular", label: "Specular Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("specular: Amount of specular light that is emitted. This is a non-physical control. You could use a light with Specular Amount 0.0 to act purely as a source of diffuse light for your scene objects and avoid adding highlights.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuse", label: "Diffuse Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("diffuse: Amount of diffuse light that is emitted. This is a non-physical control. You could use a light with Diffuse Amount 0.0 to act purely as a source of highlights for your scene objects.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "basic_2", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "areaNormalize", label: "Area Normalize", default_value: false});
			hou_parm_template2.setHelp("areaNormalize: When normalize is enabled, the amount of light contributed to the scene will not change as you scale the light source. This makes it easier to adjust highlight size without changing scene lighting.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "traceLightPaths", label: "Trace Light Paths", default_value: false});
			hou_parm_template2.setHelp("traceLightPaths: Enable light and photon tracing from this light. This value enforces a physically-based light and as a side-effect disables the above Shadows controls. Users may use this feature to selectively decide which lights emit photons when using the PxrVCM or PxrUPBP Integrators.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "thinShadow", label: "Thin Shadow", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ traceLightPaths != 0 }");
			hou_parm_template2.setHelp("thinShadow: Enable thin shadow and disable refraction caustics for this light. This parameter will ignored if Trace Light Paths is enabled. This is a non-physical control that creates 'fake' colored shadows for transmissive objects without needing to generate photons for caustics.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "fixedSampleCount", label: "Fixed Sample Count", default_value: false});
			hou_parm_template2.setHelp("fixedSampleCount: An override of the number of light samples to be taken for this light source. It will override the sampling performed by the integrator. It's recommended to leave this at the default unless you experience unsolvable noise from the light.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "lightGroup", label: "Light Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("lightGroup: Specify the light group name used for light group LPEs. This is useful to generate per-light AOVs for later adjustment in compositing.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrmeshlight',_hnt_VOP_pxrmeshlight)
    return _hnt_VOP_pxrmeshlight
}
        