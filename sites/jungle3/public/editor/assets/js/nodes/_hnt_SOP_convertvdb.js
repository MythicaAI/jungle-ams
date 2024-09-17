
export default function (hou) {
    class _hnt_SOP_convertvdb extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/convertvdb';
        static category = '/SOP';
        static houdiniType = 'convertvdb';
        static title = 'Convert VDB';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_convertvdb.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input primitives to be converted (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "conversion", label: "Convert To", menu_items: ["volume", "vdb", "poly", "polysoup"], menu_labels: ["Volume", "VDB", "Polygons", "Polygon Soup"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The type of conversion to perform\n\nVolume:\n    Convert a VDB volume into a dense Houdini volume.\n\n    This allows legacy tools to operate on the primitive,\n    however the memory requirements of dense volumes with effective\n    resolutions over 1000<sup>3</sup> might be prohibitive.\n    Consider using the __Split Disjoint Volumes__ option.\n\nVDB:\n    Convert a Houdini volume into a VDB volume.\n\n    By default, the resulting VDB will be of the same class as the input,\n    so a fog volume becomes a fog VDB and an SDF volume becomes an SDF VDB.\n\nPolygons:\n    Generate a polygonal mesh representing an isosurface of a VDB volume.\n\nPolygon Soup:\n    Generate a polygonal mesh representing an isosurface of a VDB volume.\n\n    The mesh is stored as a polygon soup, which is more compact than\n    an ordinary mesh but does not support most editing operations.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "vdbclass", label: "VDB Class", menu_items: ["none", "sdf", "fog"], menu_labels: ["No Change", "Convert Fog to SDF", "Convert SDF to Fog"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "vdbtype", label: "VDB Type", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "float", "int", "bool", "vec3f", "vec3i"], menu_labels: ["No Change", "Float", "Integer", "Bool", "Vector Float", "Vector Integer"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "Change the type of value stored at each voxel.\n\nWhen converting from a scalar type to a vector type, the scalar value\nis copied to each vector component.\n\nWhen converting from a vector type to a scalar type, voxel values are\nlost&mdash;only voxel topology is preserved.\n\nThis option is not available when VDB class conversion is enabled,\nsince SDFs and fog volumes always have scalar, floating-point values.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "vdbprecision", label: "VDB Precision", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "32", "64"], menu_labels: ["No Change", "32-bit", "64-bit"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "splitdisjointvolumes", label: "Split Disjoint Volumes", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "isovalue", label: "Isovalue", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fogisovalue", label: "Fog Isovalue", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "adaptivity", label: "Adaptivity", num_components: 1, default_value: [0], min: 0, max: 2, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "computenormals", label: "Compute Vertex Normals", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "internaladaptivity", label: "Internal Adaptivity", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "transferattributes", label: "Transfer Surface Attributes", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "When a reference surface is provided, this option transfers all attributes\n(primitive, vertex and point) from the reference surface to the output geometry.\n\nNOTE:\n    Primitive attribute values can't meaningfully be transferred to a\n    polygon soup, because the entire polygon soup is a single primitive.\n\nNOTE:\n    Computed vertex normals for primitives in the surface group\n    will be overridden.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "sharpenfeatures", label: "Sharpen Features", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "edgetolerance", label: "Edge Tolerance", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "surfacegroup", label: "Surface Group", num_components: 1, default_value: ["surface_polygons"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "interiorgroup", label: "Interior Group", num_components: 1, default_value: ["interior_polygons"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "seamlinegroup", label: "Seam Line Group", num_components: 1, default_value: ["seam_polygons"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "seampoints", label: "Seam Points", num_components: 1, default_value: ["seam_points"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "surfacemask", label: "", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "surfacemaskname", label: "Surface Mask", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 2\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "surfacemaskoffset", label: "Mask Offset", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invertmask", label: "Invert Surface Mask", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "adaptivityfield", label: "", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "adaptivityfieldname", label: "Adaptivity Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 2\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "prune", label: "", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "tolerance", label: "Prune Tolerance", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "If enabled, reduce the memory footprint of output grids that have (sufficiently large) regions of voxels with the same value, where values are considered equal if they differ by less than the specified threshold.\n\nNOTE:\n    Pruning affects only the memory usage of a grid.\n    It does not remove voxels, apart from inactive voxels\n    whose value is equal to the background."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "flood", label: "Signed-Flood Fill Output", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "Test inactive voxels to determine if they are inside or outside of an SDF and hence whether they should have negative or positive sign.\n\nNOTE:\n    This option is ignored when converting native fog volumes to VDBs.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "activateinsidesdf", label: "Activate Interior Voxels", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "Activate all voxels inside an SDF, even if they match the background value.\n\nThis option is useful if processing the resulting VDB with VEX,\nwhich operates only on active voxels of a VDB.\nHowever, disabling this option will retain only the narrow active internal\nband of an incoming SDF if it has one, saving memory and downstream processing.\n\nThis toggle has no effect for non-SDF volumes, or if\n__Signed-Flood Fill Output__ is disabled."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/convertvdb',_hnt_SOP_convertvdb)
    return _hnt_SOP_convertvdb
}
        