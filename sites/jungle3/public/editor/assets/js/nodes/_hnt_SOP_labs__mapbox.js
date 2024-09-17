
export default function (hou) {
    class _hnt_SOP_labs__mapbox extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Import/labs::mapbox';
        static category = '/SOP/labs';
        static houdiniType = 'labs::mapbox';
        static title = 'Labs MapBox';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__mapbox.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "cache_lat_lon_zoom", label: "Lat Lon Zoom", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "total_size", label: "Total Size", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bounds", label: "Bounds", num_components: 4, default_value: [0, 0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "lookup", label: "Look Up"});
			hou_parm_template.setHelp("Launch the GUI to select the map region to download.");
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().launch_map()");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().launch_map()", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder3", label: "API Key", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "api_key", label: "Mapbox API Key", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("The API key required by mapbox. Register an account at mapbox.com, from your account.mapbox.com page is an API key. Copy and paste that key into this field, and either save it with a preset, or save it as an environment variable MAPBOX_API.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Base Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "lat_lon_zoom", label: "Lat Lon Zoom", num_components: 3, default_value: [0, 0, 0], min: null, max: 180, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setHelp("The coordinates of the map region to download. Can be set manually, or automatically filled out with the GUI browser launched from the 'Look Up' button.");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "refresh", label: "Refresh"});
			hou_parm_template2.setHelp("Re-download the maps with the current co-ordinates.");
			hou_parm_template2.setScriptCallback("hou.pwd().hdaModule().update(hou.pwd())");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.pwd().hdaModule().update(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "offsets", label: "Offsets", num_components: 2, default_value: [0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("Offset from the latlong in tile units, useful for setting up tiles of downloads. Eg, make 3 copies of a mapbox sop, and set the other 3 sops to have offset of (1,0), (0,1), (1,1) to create a 4x4 region.");
			hou_parm_template2.setScriptCallback("hou.pwd().hdaModule().update(hou.pwd())");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.pwd().hdaModule().update(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "height_scale", label: "Height Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("A height multiplier, can artificially boost or lower the terrain height read from mapbox data.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "resolution_scale", label: "Resolution Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Multiplier on heighfield resolution. Default is 2048x2048, setting resolution scale to 0.25 will reduce the heightfield resolution to 512x512, resolution scale 2 will set heighfield resolution to 4096x4096. Note that it won't increase or decrease the quality of the downloaded maps, only the underlying heightfield.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "terrain_mode", label: "Terrain Mode", menu_items: ["0", "1"], menu_labels: ["Polygons", "HeightField"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setHelp("Set if terrain should be heighfield or polygon. Polygons are more general, but much slower to compute.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "height_blur_strength", label: "Height Data Blur Strength", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Blur applied to the heightmap to reduce fine detail.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder2", label: "OSM Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "offset", label: "Offset", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("Vertical offset applied to OSM data.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "snap_to_terrain", label: "Snap To Terrain", default_value: true});
			hou_parm_template3.setHelp("Project OSM data onto the heightfield, when this toggle is disabled the OSM data will be flat.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "height_from_terrain", label: "Building Height From Terrain", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ snap_to_terrain == 1 }");
			hou_parm_template3.setHelp("Set a height attribute if it exists in the OSM data (otherwise calculate it from projecting onto the terrain).");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "color_from_terrain", label: "Color From Terrain", default_value: true});
			hou_parm_template3.setHelp("Use the downloaded colour map to set a primitive colour for the buildings.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "resample_curve", label: "Resample OSM Curves", default_value: false});
			hou_parm_template3.setHelp("Enable extra points to be inserted into the building curves.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "segment_length", label: "Segment Length", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ resample_curve == 0 }");
			hou_parm_template3.setHelp("Length used to generate extra curve points for the buildings.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Local Download Paths", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "download_path_color", label: "Download Path Color", num_components: 1, default_value: ["$HIP/maps/${HIPNAME}_${OS}_terrain_color.jpg"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setHelp("Location and name of the downloaded color map.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "download_path_height", label: "Download Path Height", num_components: 1, default_value: ["$HIP/maps/${HIPNAME}_${OS}_terrain_height.png"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setHelp("Location and name of the downloaded height map.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "download_path_osm", label: "Download Path OSM", num_components: 1, default_value: ["$HIP/maps/${HIPNAME}_${OS}_city.osm"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setHelp("Location and name of the downloaded osm path data.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "spacer", label: "_", column_labels: [""]});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "like_tool", label: "Like Tool"});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setHelp("Let us know that you're enjoying this Tool");
			hou_parm_template.setScriptCallback("import gamedevutils;gamedevutils.like_node(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"button_icon": "heart.svg", "script_callback": "import gamedevutils;gamedevutils.like_node(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "dont_like", label: "Thumbs Down"});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setHelp("Let us know you don't like this tool. Ideally also send us a mail at support@sidefx.com");
			hou_parm_template.setScriptCallback("import gamedevutils;gamedevutils.dislike_node(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"button_icon": "thumbs-down.svg", "script_callback": "import gamedevutils;gamedevutils.dislike_node(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "mapbox_sales", label: "Contact Mapbox"});
			hou_parm_template.setScriptCallback("import webbrowser;webbrowser.open_new(\"https://www.mapbox.com/contact/sales/\")");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import webbrowser;webbrowser.open_new(\"https://www.mapbox.com/contact/sales/\")", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Import/labs::mapbox',_hnt_SOP_labs__mapbox)
    return _hnt_SOP_labs__mapbox
}
        