
export default function (hou) {
    class _hnt_SOP_vdbmorphsdf extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbmorphsdf';
        static category = '/SOP';
        static houdiniType = 'vdbmorphsdf';
        static title = 'VDB Morph SDF';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbmorphsdf.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "sourcegroup", label: "Source", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input level set VDBs to be morphed (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "targetgroup", label: "Target", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The target level set VDB (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "mask", label: "", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "maskname", label: "Alpha Mask", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 2\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "morphingheading", label: "Morphing", column_labels: [""]});
			hou_parm_template.setTags({"houdini_utils::doc": "These parameters control how the SDF moves from the source to the target."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "timestep", label: "Timestep", num_components: 1, default_value: [1], default_expression: ["1.0/$FPS"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "The number of seconds of movement to apply to the input points\n\nThe default is `1/$FPS` (one frame's worth of time).\n\nTIP:\n    This parameter can be animated through time using the `$T`\n    expression. To control how fast the morphing is done, multiply `$T`\n    by a scale factor. For example, to animate it twice as fast, use\n    the expression, `$T*2`.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "advectspatial", label: "Spatial Scheme", num_components: 1, default_value: ["hjweno5_bias"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["first_bias", "hjweno5_bias"], menu_labels: ["1st-order biased gradient", "5th-order HJ-WENO biased gradient"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately the gradients of the signed distance field\nare computed during advection\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "advecttemporal", label: "Temporal Scheme", num_components: 1, default_value: ["tvd_rk2"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["tvd_rk1", "tvd_rk2", "tvd_rk3"], menu_labels: ["Forward Euler", "2nd-order Runge-Kutta", "3rd-order Runge-Kutta"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately time is evolved within each advection step\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "renormheading", label: "Renormalization", column_labels: [""]});
			hou_parm_template.setTags({"houdini_utils::doc": "After morphing the signed distance field, it will often no longer contain valid distances.  A number of renormalization passes can be performed to convert it back into a proper signed distance field."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "normsteps", label: "Steps", num_components: 1, default_value: [3], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "renormspatial", label: "Spatial Scheme", num_components: 1, default_value: ["hjweno5_bias"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["first_bias", "hjweno5_bias"], menu_labels: ["1st-order biased gradient", "5th-order HJ-WENO biased gradient"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately the gradients of the signed distance field\nare computed during renormalization\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "renormtemporal", label: "Temporal Scheme", num_components: 1, default_value: ["tvd_rk2"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["tvd_rk1", "tvd_rk2", "tvd_rk3"], menu_labels: ["Forward Euler", "2nd-order Runge-Kutta", "3rd-order Runge-Kutta"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How accurately time is evolved during renormalization\n\nThe later choices are more accurate but take more time."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "maskheading", label: "Alpha Mask", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invert", label: "Invert Alpha Mask", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "minmask", label: "Min Mask Cutoff", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "maxmask", label: "Max Mask Cutoff", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbmorphsdf',_hnt_SOP_vdbmorphsdf)
    return _hnt_SOP_vdbmorphsdf
}
        