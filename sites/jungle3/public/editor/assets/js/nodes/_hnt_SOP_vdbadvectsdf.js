
export default function (hou) {
    class _hnt_SOP_vdbadvectsdf extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbadvectsdf';
        static category = '/SOP';
        static houdiniType = 'vdbadvectsdf';
        static title = 'VDB Advect';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbadvectsdf.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of VDBs in the first input to move using the velocity field (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "velgroup", label: "Velocity", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The name of a VDB primitive in the second input to use as the velocity field (see [specifying volumes|/model/volumes#group])\n\nThis must be a vector-valued VDB primitive. You can use the [Vector Merge node|Node:sop/DW_OpenVDBVectorMerge] to turn a `vel.[xyz]` triple into a single primitive.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "respectclass", label: "Respect Grid Class", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "When this option is disabled, all VDBs will use a general numerical advection scheme, otherwise level set VDBs will be advected using a spatial finite-difference scheme."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "timestep", label: "Timestep", num_components: 1, default_value: [1], default_expression: ["1.0/$FPS"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "Number of seconds of movement to apply to the input points\n\nThe default is `1/$FPS` (one frame's worth of time). You can use negative values to move the points backwards through the velocity field."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "general", label: "General Advection", column_labels: [""]});
			hou_parm_template.setTags({"houdini_utils::doc": "These control how VDBs that are not level sets are moved through the velocity field. If the grid class is not being respected, all grids will be advected using general advection regardless of whether they are level sets or not."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "substeps", label: "Substeps", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The number of substeps per integration step\n\nThe only reason to increase this above its default value of one is to reduce the memory footprint from dilations&mdash;likely at the cost of more smoothing."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "advection", label: "Advection Scheme", num_components: 1, default_value: ["semi"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["semi", "mid", "rk3", "rk4", "mac", "bfecc"], menu_labels: ["Semi-Lagrangian", "Mid-Point", "3rd order Runge-Kutta", "4th order Runge-Kutta", "MacCormack", "BFECC"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "limiter", label: "Limiter Scheme", num_components: 1, default_value: ["revert"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "clamp", "revert"], menu_labels: ["No limiter", "Clamp to extrema", "Revert to 1st order"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "advectionHeading", label: "Level Set Advection", column_labels: [""]});
			hou_parm_template.setTags({"houdini_utils::doc": "These control how level set VDBs are moved through the velocity field. If the grid class is not being respected, these options are not used."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "advectspatial", label: "Spatial Scheme", num_components: 1, default_value: ["hjweno5_bias"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["first_bias", "hjweno5_bias"], menu_labels: ["1st-order biased gradient", "5th-order HJ-WENO biased gradient"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately the gradients of the signed distance field are computed\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "advecttemporal", label: "Temporal Scheme", num_components: 1, default_value: ["tvd_rk2"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["tvd_rk1", "tvd_rk2", "tvd_rk3"], menu_labels: ["Forward Euler", "2nd-order Runge-Kutta", "3rd-order Runge-Kutta"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately time is evolved within the timestep\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "renormheading", label: "Renormalization", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "normsteps", label: "Steps", num_components: 1, default_value: [3], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"houdini_utils::doc": "After advection, a signed distance field will often no longer contain correct distances.  A number of renormalization passes can be performed between every substep to convert it back into a proper signed distance field."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "renormspatial", label: "Spatial Scheme", num_components: 1, default_value: ["hjweno5_bias"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["first_bias", "hjweno5_bias"], menu_labels: ["1st-order biased gradient", "5th-order HJ-WENO biased gradient"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately the gradients of the signed distance field are computed\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "renormtemporal", label: "Temporal Scheme", num_components: 1, default_value: ["tvd_rk1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["tvd_rk1", "tvd_rk2", "tvd_rk3"], menu_labels: ["Forward Euler", "2nd-order Runge-Kutta", "3rd-order Runge-Kutta"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately time is evolved within the renormalization stage\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbadvectsdf',_hnt_SOP_vdbadvectsdf)
    return _hnt_SOP_vdbadvectsdf
}
        