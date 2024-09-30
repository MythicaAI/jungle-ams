
export default function (hou) {
    class _hnt_SOP_vdbresample extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbresample';
        static category = '/SOP';
        static houdiniType = 'vdbresample';
        static title = 'VDB Resample';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbresample.svg';
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
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDBs to be resampled (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "reference", label: "Reference", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "order", label: "Interpolation", menu_items: ["point", "linear", "quadratic"], menu_labels: ["Nearest", "Linear", "Quadratic"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "How to interpolate values at fractional voxel positions\n\nNearest:\n    Use the value from the nearest voxel.\n\n    This is fast but can cause aliasing artifacts.\nLinear:\n    Interpolate trilinearly between the values of immediate neighbors.\n\n    This matches what [Node:sop/volumemix] and [Vex:volumesample] do.\nQuadratic:\n    Interpolate triquadratically between the values of neighbors.\n\n    This produces smoother results than trilinear interpolation but is slower.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "mode", label: "Define Transform", menu_items: ["explicit", "refvdb", "voxelsizeonly", "voxelscaleonly"], menu_labels: ["Explicitly", "To Match Reference VDB", "Using Voxel Size Only", "Using Voxel Scale Only"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "How to generate the new VDB's transform\n\nExplicitly:\n    Use the values of the transform parameters below.\nTo Match Reference VDB:\n    Match the transform and voxel size of a reference VDB.\n\n    The resulting volume is a copy of the input VDB,\n    aligned to the reference VDB.\nUsing Voxel Size Only:\n    Set a new voxel size, increasing or decreasing the resolution.\n    This can be applied to the transform of the input VDB or\n    an axis-aligned linear transform.\nUsing Voxel Scale Only:\n    Scale the new voxel size, increasing or decreasing the resolution.\n    This can be applied to the transform of the input VDB or\n    an axis-aligned linear transform.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "xOrd", label: "Transform Order", menu_items: ["srt", "str", "rst", "rts", "tsr", "trs"], menu_labels: ["Scale Rot Trans", "Scale Trans Rot", "Rot Scale Trans", "Rot Trans Scale", "Trans Scale Rot", "Trans Rot Scale"], default_value: 4, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "rOrd", label: "", menu_items: ["xyz", "xzy", "yxz", "yzx", "zxy", "zyx"], menu_labels: ["Rx Ry Rz", "Rx Rz Ry", "Ry Rx Rz", "Ry Rz Rx", "Rz Rx Ry", "Rz Ry Rx"], default_value: 5, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "t", label: "Translate Voxels", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "r", label: "Rotate", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "s", label: "Scale", num_components: 3, default_value: [1, 1, 1], min: 1e-06, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "p", label: "Pivot", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "voxelsize", label: "Voxel Size", num_components: 1, default_value: [1], min: 1e-06, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "voxelscale", label: "Voxel Scale", num_components: 1, default_value: [1], min: 1e-06, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "linearxform", label: "Force Axis Aligned", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "xformvectors", label: "Transform Vectors", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "rebuild", label: "Rebuild SDF", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "prune", label: "Prune Tolerance", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "tolerance", label: "Prune Tolerance", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbresample',_hnt_SOP_vdbresample)
    return _hnt_SOP_vdbresample
}
        