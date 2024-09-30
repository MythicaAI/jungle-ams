
export default function (hou) {
    class _hnt_COP2_skyenvmap extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'COP2/Matte/skyenvmap';
        static category = '/COP2';
        static houdiniType = 'skyenvmap';
        static title = 'Sky Environment Map';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_skyenvmap.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "resolution", label: "Resolution", num_components: 1, default_value: [256], min: 1, max: 512, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Sun", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "sun_dir_spec", label: "Use", num_components: 1, default_value: ["3"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["3", "4", "0", "1", "2"], menu_labels: ["Rotate Angles", "Direction Vector", "Azimuth and Elevation", "Location, Date, and Time", "Location and Fractional Day of Year"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sun_dir_rotate", label: "Rotate", num_components: 3, default_value: [45, 180, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 3 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sun_dir_vector", label: "Direction Vector", num_components: 3, default_value: [0, 1, 1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 4 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sun_azimuth", label: "Azimuth", num_components: 1, default_value: [180], min: 0, max: 360, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sun_elevation", label: "Elevation", num_components: 1, default_value: [45], min: 0, max: 90, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "geo_latitude", label: "Latitude", num_components: 1, default_value: [0], min: null, max: 90, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 sun_dir_spec != 2 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "geo_longitude", label: "Longitude", num_components: 1, default_value: [0], min: null, max: 180, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 sun_dir_spec != 2 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "geo_month", label: "Date", menu_items: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], menu_labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "geo_day", label: "Day", num_components: 1, default_value: [1], min: 1, max: 31, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "geo_time", label: "Time", num_components: 2, default_value: [12, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "geo_hr_spec", label: "Hour Spec", menu_items: ["0", "1", "3"], menu_labels: ["AM", "PM", "24hr"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "geo_time_zone", label: "Time Zone", menu_items: ["", "UTC", "UTC-1", "UTC-2", "UTC-3", "UTC-4", "UTC-5", "UTC-6", "UTC-7", "UTC-8", "UTC-9", "UTC-10", "UTC-11", "UTC+12", "UTC+11", "UTC+10", "UTC+9", "UTC+8", "UTC+7", "UTC+6", "UTC+5", "UTC+4", "UTC+3", "UTC+2", "UTC+1"], menu_labels: ["Default (calculated from longitude)", "UTC (GMT, WET)", "N (UTC - 1)", "O (UTC - 2)", "P (UTC - 3)", "AST (UTC - 4)", "EST (UTC - 5)", "CST (UTC - 6)", "MST (UTC - 7)", "PST (UTC - 8)", "AKST (UTC - 9)", "HAST (UTC - 10)", "X (UTC - 11)", "M (UTC + 12)", "L (UTC + 11)", "EST (UTC + 10)", "I (UTC + 9)", "WST (UTC + 8)", "CXT (UTC + 7)", "F (UTC + 6)", "E (UTC + 5)", "D (UTC + 4)", "MSK (UTC + 3)", "EET (UTC + 2)", "CET (UTC + 1)"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "geo_daylight", label: "Daylight Saving", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "geo_doy", label: "Day of Year", num_components: 1, default_value: [0.5], min: 0, max: 365, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sun_dir_spec != 2 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1_1", label: "Sky", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.MenuParmTemplate({name: "sky_color_spec", label: "Use", menu_items: ["0", "1"], menu_labels: ["Realistic", "Ramp"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sky_turbidity", label: "Haziness", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sky_color_spec != 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sky_brightness", label: "Brightness", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sky_color_spec != 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "sky_ramp", label: "Color Ramp", ramp_parm_type: hou.rampParmType.Color, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sky_color_spec != 1 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampbasis_var": "sky_ramp_basis", "rampbasisdefault": "catmull-rom", "rampcolordefault": "1pos ( 0 ) 1c ( 0.17 0.16 0.66 ) 1interp ( linear ) 2pos ( 0.95 ) 2c ( 0.43 0.72 0.9 ) 2interp ( linear ) 3pos ( 1 ) 3c ( 0.96 0.91 0.23 ) 3interp ( linear )", "rampkeys_var": "sky_ramp_keys", "rampshowcontrolsdefault": "0", "rampvalues_var": "sky_ramp_vals"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1_2", label: "Ground", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "ground_type", label: "Render Ground As", num_components: 1, default_value: ["color"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["color", "horizon", "mirror", "none"], menu_labels: ["Albedo", "Infinite Horizon", "Mirror", "None"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "ground_color", label: "Albedo", num_components: 3, default_value: [0.6, 0.4, 0.3], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "ground_normal", label: "Normal", num_components: 3, default_value: [0, 1, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sky_color_spec == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "horizon_elevation", label: "Horizon Elevation", num_components: 1, default_value: [0], min: null, max: 90, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ sky_color_spec == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Matte/skyenvmap',_hnt_COP2_skyenvmap)
    return _hnt_COP2_skyenvmap
}
        