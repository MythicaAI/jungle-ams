
export default function (hou) {
    class _hnt_SOP_vdbadvectpoints extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbadvectpoints';
        static category = '/SOP';
        static houdiniType = 'vdbadvectpoints';
        static title = 'VDB Advect Points';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbadvectpoints.svg';
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
			let hou_parm_template = new hou.ToggleParmTemplate({name: "advectvdbpoints", label: "Advect VDB Points", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "If enabled, advect the points in a VDB Points grid, otherwise apply advection only to the Houdini point associated with the VDB primitive.\n\nThe latter is faster to compute but updates the VDB transform only and not the relative positions of the points within the grid. It is useful primarily when instancing multiple static VDB point sets onto a dynamically advected Houdini point set."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Point Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "vdbpointsgroups", label: "VDB Points Groups", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "velgroup", label: "Velocity VDB", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The name of a VDB primitive in the second input to use as the velocity field (see [specifying volumes|/model/volumes#group])\n\nThis must be a vector-valued VDB primitive. You can use the [Vector Merge node|Node:sop/DW_OpenVDBVectorMerge] to turn a `vel.[xyz]` triple into a single primitive.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "cptgroup", label: "Closest-Point VDB", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The name of a VDB primitive in the third input to use for the closest point values (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 2\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "operation", label: "Operation", num_components: 1, default_value: ["advection"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["advection", "projection", "cadvection"], menu_labels: ["Advection", "Projection", "Constrained Advection"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How to use the velocity field to move the points\n\nAdvection:\n    Move each point along the velocity field.\nProjection:\n    Move each point to the nearest surface point using the closest point field.\nConstrained Advection:\n    Move the along the velocity field, and then project using the    closest point field. This forces the particles to remain on a surface."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "integration", label: "Integration", num_components: 1, default_value: ["fwd euler"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["fwd euler", "2nd rk", "3rd rk", "4th rk"], menu_labels: ["Forward Euler", "Second-Order Runge-Kutta", "Third-Order Runge-Kutta", "Fourth-Order Runge-Kutta"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "Algorithm to use to move the points\n\nLater options in the list are slower but better follow the velocity field."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "iterations", label: "Iterations", num_components: 1, default_value: [0], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Number of times to try projecting to the nearest point on the surface\n\nProjecting might not move exactly to the surface on the first try. More iterations are slower but give more accurate projection."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "timestep", label: "Timestep", num_components: 1, default_value: [1], default_expression: ["1.0/$FPS"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "Number of seconds of movement to apply to the input points\n\nThe default is `1/$FPS` (one frame's worth of time). You can use negative values to move the points backwards through the velocity field.\n\nIf the attribute `traillen` is present, it is multiplied by this time step allowing per-particle variation in trail length."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "steps", label: "Substeps", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"houdini_utils::doc": "How many times to repeat the advection step\n\nThis will produce a more accurate motion, especially if large time steps or high velocities are present."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "outputstreamlines", label: "Output Streamlines", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Generate polylines instead of moving points.\n\nThis is useful for visualizing the effect of the node. It may also be useful for special effects (see also the [Trail SOP|Node:sop/trail])."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbadvectpoints',_hnt_SOP_vdbadvectpoints)
    return _hnt_SOP_vdbadvectpoints
}
        