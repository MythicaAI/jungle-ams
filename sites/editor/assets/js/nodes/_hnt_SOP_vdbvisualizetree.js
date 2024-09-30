
export default function (hou) {
    class _hnt_SOP_vdbvisualizetree extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbvisualizetree';
        static category = '/SOP';
        static houdiniType = 'vdbvisualizetree';
        static title = 'VDB Visualize Tree';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbvisualizetree.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The VDBs to be visualized (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addcolor", label: "Color", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "Specify whether to generate geometry with the `Cd` color attribute."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "previewfrustum", label: "Frustum", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "For VDBs with [frustum transforms|https://www.openvdb.org/documentation/doxygen/transformsAndMaps.html#sFrustumTransforms], generate geometry representing the frustum bounding box."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "drawleafnodes", label: "", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "leafmode", label: "Leaf Nodes", menu_items: ["wirebox", "box"], menu_labels: ["Wireframe Boxes", "Solid Boxes"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Specify whether to render the leaf nodes of VDB trees as wireframe boxes, as solid boxes, or as a single point in the middle of each node.\n\nIf __Color__ is enabled, leaf nodes will be blue."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "drawinternalnodes", label: "", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "internalmode", label: "Internal Nodes", menu_items: ["wirebox", "box"], menu_labels: ["Wireframe Boxes", "Solid Boxes"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Specify whether to render the internal nodes of VDB trees as wireframe boxes or as solid boxes.\n\nIf __Color__ is enabled, the lowest-level internal nodes will be green and higher-level internal nodes will be orange."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "drawtiles", label: "", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "tilemode", label: "Active Tiles", menu_items: ["points", "wirebox", "box"], menu_labels: ["Points", "Wireframe Boxes", "Solid Boxes"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Specify whether to render the active tiles of VDB trees as wireframe boxes, as solid boxes, or as a single point in the middle of each tile.\n\nIf __Color__ is enabled, negative-valued tiles will be white and nonnegative tiles will be red."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "drawvoxels", label: "", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "voxelmode", label: "Active Voxels", menu_items: ["points", "wirebox", "box"], menu_labels: ["Points", "Wireframe Boxes", "Solid Boxes"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Specify whether to render the active voxels of VDB trees as wireframe boxes, as solid boxes, or as a single point in the middle of each voxel.\n\nIf __Color__ is enabled, negative-valued voxels will be white and nonnegative voxels will be red.\n\nWARNING:\n    Rendering active voxels as boxes can generate large amounts of geometry."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "ignorestaggered", label: "Ignore Staggered Vectors", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addindexcoord", label: "Points with Index Coordinates", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "For voxels, tiles, and leaf nodes rendered as points, add an attribute to the points that gives the coordinates of the points in the VDB's [index space|https://www.openvdb.org/documentation/doxygen/overview.html#secSpaceAndTrans]."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addvalue", label: "Points with Values", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "For voxels and tiles rendered as points, add an attribute to the points that gives the voxel and tile values."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usegridname", label: "Name Point Attributes After VDBs", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "If enabled, name the attribute added by __Points with Values__ after the VDB primitive.  If disabled or if a VDB has no name, name the point attribute according to its type: `vdb_int`, `vdb_float`, `vdb_vec3f`, etc."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbvisualizetree',_hnt_SOP_vdbvisualizetree)
    return _hnt_SOP_vdbvisualizetree
}
        