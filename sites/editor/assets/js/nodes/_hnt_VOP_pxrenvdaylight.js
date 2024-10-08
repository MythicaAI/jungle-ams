
export default function (hou) {
    class _hnt_VOP_pxrenvdaylight extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrenvdaylight';
        static category = '/VOP';
        static houdiniType = 'pxrenvdaylight';
        static title = 'Pxr Environment Day Light';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrenvdaylight.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "intensity", label: "Intensity", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("intensity: Scales the contribution of this light linearly.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "exposure", label: "Exposure", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("exposure: Specify the intensity of the light source as a power of 2 (in stops). Increasing the exposure by 1 will double the energy emitted by the light source. A value of 0 produces an intensity of 1, -1 produces .5. You may wonder why you might use Exposure, and the answer is that real world lighting has high energies and typical exposures are low values while you may have to type a really large number for equivalent Intensity. This is also comfortable to artists familiar with photographic measurements.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "sunDirection", label: "Direction", num_components: 3, default_value: [0, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("sunDirection: The *apparent* direction towards the center of the sun. The zenith is at +Y (for noon light) and the horizon is in the XZ plane (for sunrise/set). Note that the Y component must non-negative. Ignored if a month is given.");
			hou_parm_template.setTags({"script_ritype": "vector"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "haziness", label: "Haziness", num_components: 1, default_value: [2], min: 1.7, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("haziness: The turbidity of the sky. The lower limit of the model is 1.7 for an exceptionally clear sky, and 10, for an inversion, is the upper limit.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "skyTint", label: "Sky Tint", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("skyTint: Tweak the sky's contribution and color. The default, white (1,1,1), gives results based on measured physical values.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "sunTint", label: "Sun Tint", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("sunTint: Tweak the sun's contribution and color. The default, white (1,1,1), gives results based on measured physical values. Setting this to black removes the sun contribution.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "sunSize", label: "Sun Size", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("sunSize: Scale the apparent size of the sun in the sky. Leave at 1 for a realistic sun size with an 0.55 degree angular diameter.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "month", label: "Month", menu_items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], menu_labels: ["Use Direction", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("month: Month of the year, 1 through 12. The default, 0, means to use the explicitly given sun direction instead of automatically computing it.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "day", label: "Day", num_components: 1, default_value: [1], min: 1, max: 31, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("day: Day of the month, 1 through 31. This is ignored if month is 0.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "year", label: "Year", num_components: 1, default_value: [2015], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("year: Four-digit year. This is ignored if month is 0.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "hour", label: "Hour", num_components: 1, default_value: [14.6333], min: 0, max: 24, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("hour: Hours since midnight, local standard time. May be fractional to include minutes and seconds. If daylight saving time is in effect, subtract 1 to correct to standard time. This is ignored if month is 0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "zone", label: "Time Zone", num_components: 1, default_value: [null], min: null, max: 14, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("zone: Standard time zone offset from GMT/UTC in hours. Positive for east, negative for west. For example, this would be -8 for Pacific time. This is ignored if month is 0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "latitude", label: "Latitude", num_components: 1, default_value: [47.602], min: null, max: 90, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("latitude: Latitude in degrees. Positive for north, negative for south. Ranges frmo -90 to +90 degrees. This is ignored if month is 0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "longitude", label: "Longitude", num_components: 1, default_value: [null], min: null, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("longitude: Longitude in degrees. Positive for east, negative for west. Ranges frmo -180 to +180 degrees. This is ignored if month is 0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "refine", label: "Refine", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "specular", label: "Specular Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("specular: Amount of specular light that is emitted. This is a non-physical control. You could use a light with Specular Amount 0.0 to act purely as a source of diffuse light for your scene objects and avoid adding highlights.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "diffuse", label: "Diffuse Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("diffuse: Amount of diffuse light that is emitted. This is a non-physical control. You could use a light with Diffuse Amount 0.0 to act purely as a source of highlights for your scene objects.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "refine_1", label: "Shadows", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
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
			hou_parm_template2.setHelp("shadowDistance: The maximum distance of the shadow starting from the position of the point being shaded. -1.0 is unset which will use the distance between the point being shaded and the point on the light. You may use this control to artificially reduce the distance shadows are cast. This may also increase render speed by not calculating shadows outside this distance");
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
			hou_parm_template = new hou.FolderParmTemplate({name: "refine_2", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "traceLightPaths", label: "Trace Light Paths", default_value: false});
			hou_parm_template2.setHelp("traceLightPaths: Enable light and photon tracing from this light. This value enforces a physically-based light and as a side-effect disables the above Shadows controls. Users may use this feature to selectively decide which lights emit photons when using the PxrVCM or PxrUPBP Integrators.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "thinShadow", label: "Thin Shadow", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ traceLightPaths != 0 }");
			hou_parm_template2.setHelp("thinShadow: Enable thin shadow.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "fixedSampleCount", label: "Light Samples", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("fixedSampleCount: Specifies an override of the number of light samples to be taken for this light source. If set to something other than zero, it will override the sampling performed by the integrator. You might find need for this if you have unsolvable noise from this light and need more samples.");
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
    hou.registerType('VOP/Other/pxrenvdaylight',_hnt_VOP_pxrenvdaylight)
    return _hnt_VOP_pxrenvdaylight
}
        