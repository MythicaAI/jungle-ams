
export default function (hou) {
    class _hnt_VOP_pxrspherelight extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrspherelight';
        static category = '/VOP';
        static houdiniType = 'pxrspherelight';
        static title = 'Pxr Sphere Light';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrspherelight.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "basic", label: "Basic", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "intensity", label: "Intensity", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("intensity: Specify the intensity of the light source linearly. The light intensity is computed using physical units.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "exposure", label: "Exposure", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("exposure: Specify the intensity of the light source as a power of 2 (in stops). Increasing the exposure by 1 will double the energy emitted by the light source. A value of 0 produces an intensity of 1, -1 produces .5. Real world lighting has high energies and typical exposures are low values while you may have to type a really large number for equivalent Intensity. This is also comfortable to artists familiar with photographic measurements.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "lightColor", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("lightColor: The color of the emitted light. If a color map is specified, this tints the color map.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "enableTemperature", label: "Enable Temperature", default_value: false});
			hou_parm_template2.setHelp("enableTemperature: Turns color temperature on or off.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "temperature", label: "Temperature", num_components: 1, default_value: [6500], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableTemperature != 1 }");
			hou_parm_template2.setHelp("temperature: Allow the user to choose the color temperature of the light in Kelvins. This control will act like a filter (a tinted transparent surface) in front of your light. If your light is white, you will get the chosen color temperature. If your light is colored, the color temperature will make it cooler (over 6500K) or warmer (below 6500K). NOTE: The effect will be less pronounced on fully saturated mono-chromatic lights. Defaults to 6500 K, the D65 illuminant (white point) used by sRGB and Rec. 709.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "basic_1", label: "Refine", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "emissionFocus", label: "Emission Focus", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("emissionFocus: Off-axis cosine power exponent to shape the emission. This controls the spread of the light. Higher number will start focusing the light towards the center and thus narrowing the light spread.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "emissionFocusTint", label: "Emission Focus Tint", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("emissionFocusTint: Off-axis light color tint. This tints the emission in the falloff region starting from the off-angle direction of the light towards the center. By default, the tint color is black (none). In addition to tinting, value greater than white will also increase the intensity of the falloff region.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "specular", label: "Specular Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("specular: Amount of specular light that is emitted. This is a non-physical control. You could use a light with Specular Amount 0.0 to act purely as a source of diffuse light for your scene objects and avoid adding highlights.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuse", label: "Diffuse Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("diffuse: Amount of diffuse light that is emitted. This is a non-physical control. You could use a light with Diffuse Amount 0.0 to act purely as a source of highlights for your scene objects.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "intensityNearDist", label: "Intensity Near Dist", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("intensityNearDist: Near distance between the point being illuminated and the light at which the sample doesn't get brighter. This may help you avoid hot spots and sampling issues where a light is near a surface.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "coneAngle", label: "Cone Angle", num_components: 1, default_value: [90], min: 0, max: 90, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("coneAngle: Angle of the virtual flaps on the light to turn it into a spot light. This does not affect IES Profiles (should you be using one).");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "coneSoftness", label: "Cone Softness", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("coneSoftness: Softness of the cut-off of the cone angle. The regular range is from 0 (hard cut-off) to 1 (full smooth transition), but it can be set higher than 1 for additional gradation.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "basic_2", label: "Light Profile", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "iesProfile", label: "IES Profile", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setHelp("iesProfile: Name of the IES light profile.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "iesProfileScale", label: "Profile Scale", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Rescales the angular distribution of the ies profiles. Values larger than 0 scale the profile to the front of the light, values less than 0 scale the profile to the back.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "basic_3", label: "Shadows", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "enableShadows", label: "Enable Shadows", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ traceLightPaths != 0 }");
			hou_parm_template2.setHelp("enableShadows: Enable raytraced shadows.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "shadowColor", label: "Shadow Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableShadows != 1 } { traceLightPaths != 0 }");
			hou_parm_template2.setHelp("shadowColor: The color of the shadows cast by emitted light.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "shadowDistance", label: "Shadow Max Distance", num_components: 1, default_value: [null], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableShadows != 1 } { traceLightPaths != 0 }");
			hou_parm_template2.setHelp("shadowDistance: Limits the shadow distance. -1.0 is unset which will use the distance between the point being shaded and the point on the light. You may use this control to artificially reduce the distance shadows are cast. This may also increase render speed by not calculating shadows outside this distance.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "shadowFalloff", label: "Shadow Falloff", num_components: 1, default_value: [null], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableShadows != 1 } { traceLightPaths != 0 }");
			hou_parm_template2.setHelp("shadowFalloff: the distance from the light at which shadow falloff begins. -1.0 turns off shadow falloff. This is used along with Shadow Max Distance to create a false fade for shadows that are reduced or cut off by the Shadow Max Distance parameter.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "shadowFalloffGamma", label: "Shadow Falloff Gamma", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableShadows != 1 } { traceLightPaths != 0 }");
			hou_parm_template2.setHelp("shadowFalloffGamma: The gamma of the shadow strength in the falloff zone. This requires the use of Shadow Max Distance and Shadow Falloff.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "shadowSubset", label: "Trace Subset", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableShadows != 1 } { traceLightPaths != 0 }");
			hou_parm_template2.setHelp("shadowSubset: Set of geometry to consider for traced shadow intersection. If this is not specified, all geometry are considered for traced shadow intersection.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "shadowExcludeSubset", label: "Don't Trace Subset", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ enableShadows != 1 } { traceLightPaths != 0 }");
			hou_parm_template2.setHelp("shadowExcludeSubset: Set of geometry to ignore for traced shadow intersection. If this is not specified, all geometry is used for traced shadow intersection.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "basic_4", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "areaNormalize", label: "Normalize", default_value: false});
			hou_parm_template2.setHelp("When normalize is enabled, the amount of light contributed to the scene will not change as you scale the light source. This makes it easier to adjust highlight size without changing scene lighting.");
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
			hou_parm_template2 = new hou.IntParmTemplate({name: "fixedSampleCount", label: "Light Samples", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("fixedSampleCount: Specifies an override of the number of light samples to be taken for this light source. If set to something other than zero, it will override the sampling performed by the integrator. It's recommended to leave this at the default unless you experience unsolvable noise from the light.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "lightGroup", label: "Light Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("lightGroup: Specify the light group name used for light group LPEs. This is useful to generate per-light AOVs for later adjustment in compositing.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "importanceMultiplier", label: "Importance Multiplier", num_components: 1, default_value: [1], min: 0.01, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Importance of this light for noise control.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrspherelight',_hnt_VOP_pxrspherelight)
    return _hnt_VOP_pxrspherelight
}
        