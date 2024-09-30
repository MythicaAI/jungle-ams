
export default function (hou) {
    class _hnt_SOP_vdbextrapolate extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbextrapolate';
        static category = '/SOP';
        static houdiniType = 'vdbextrapolate';
        static title = 'VDB Extrapolate';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbextrapolate.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Source Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDB scalar grid(s) to be processed\nin an operation involving Fast Sweeping.\n(see [specifying volumes|/model/volumes#group]).", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "extfields", label: "Extension Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "Arbitrary VDB fields picked up by this group\nwill be extended off an iso-surface of a scalar VDB (fog/level set)\nas specified by the __Source Group__. The mode enables this\nparameter is __Extend Field(s) Off Fog VDB__ or __Extend Field(s) Off SDF__.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "mask", label: "Mask VDB", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A VDB volume whose active voxels are to be used as a mask\n(see [specifying volumes|/model/volumes#group]).\nThe mode that enables the use of this parameter is\n__Expand SDF Into Mask SDF__.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "sweep", label: "General Sweep", column_labels: [""]});
			hou_parm_template.setTags({"houdini_utils::doc": "These parameters control the Fast Sweeping operation."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "mode", label: "Operation", num_components: 1, default_value: ["dilate"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["dilate", "mask", "convert", "renormalize", "fogext", "sdfext"], menu_labels: ["Expand SDF Narrowband", "Expand SDF Into Mask SDF", "Convert Fog VDB To SDF", "Renormalize SDF", "Extend Field(s) Off Fog VDB", "Extend Field(s) Off SDF"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "The operation to perform\n\n__Expand SDF Narrowband__:\n    Dilates the narrowband of an existing signed distance field by a specified\n    number of voxels.\n__Expand SDF Into Mask SDF__:\n    Expand/extrapolate an existing signed distance field into\n    a mask.\n__Convert Fog VDB To SDF__:\n    Converts a scalar Fog volume into a signed distance\n    grid. Active input voxels with scalar values above\n    the given isoValue will have NEGATIVE distance\n    values on output, i.e. they are assumed to be INSIDE\n    the iso-surface.\n__Renormalize SDF__:\n    Given an existing approximate SDF it solves the Eikonal\n    equation for all its active voxels. Active input voxels\n    with a signed distance value above the given isoValue\n    will have POSITIVE distance values on output, i.e. they are\n    assumed to be OUTSIDE the iso-surface.\n__Extend Field(s) Off Fog VDB__:\n     Computes the extension of several attributes off a Fog volume.\n     The attributes are defined by VDB grids that will be sampled\n     on the iso-surface of a Fog volume (defined by the __Source Group__).\n     The attributes are defined by the __Extension Group__ parameter.\n     This mode only uses the first Fog grid\n     specified by the __Source Group__ parameter.\n__Extend Field(s) Off SDF__:\n     Computes the extension of several attributes off a signed distance field.\n     The attributes are defined by VDB grids that will be sampled\n     on the iso-surface of an SDF (defined by the __Source Group__).\n     The attributes are defined by the __Extension Group__ parameter.\n     This mode only uses the first SDF grid\n     specified by the __Source Group__ parameter."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "sweepdomain", label: "Domain Direction", num_components: 1, default_value: ["alldirection"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["alldirection", "greaterthanisovalue", "lessthanisovalue"], menu_labels: ["All Directions", "Greater Than Isovalue", "Less Than Isovalue"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "The options for sweeping domain direction are:\n__All Directions__\n    Perform an update for the extension field(s) in all directions.\n__Greater Than Isovalue__\n    Perform an update for the extension field(s) for voxels corresponding.\n    to a signed distance function/fog that is greater than a given isovalue.\n__Less Than Isovalue__\n    Perform an update for the extension field for voxels corresponding.\n    to a signed distance function/fog that is less than a given isovalue."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "convertorrenormalize", label: "Convert Fog To SDF or Renormalize SDF", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Use this option if one wants to convert the Fog grid specified by the __Source Group__\nto be an SDF or to renormalize an SDF."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "sweeps", label: "Iterations", num_components: 1, default_value: [1], min: 1, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The number of iterations of the Fast Sweeping algorithm\n(one is often enough)."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "sdfisovalue", label: "Sdf Isovalue", num_components: 1, default_value: [0], min: null, max: 3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "Isovalue that defines an implicit surface of an SDF."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fogisovalue", label: "Fog Isovalue", num_components: 1, default_value: [0.5], min: null, max: 3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "Isovalue that defines an implicit surface of a Fog volume."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "ignoretiles", label: "Ignore Active Tiles", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Ignore active tiles in scalar field and mask VDBs.\n\nThis option should normally be disabled, but note that active tiles\n(sparsely represented regions of constant value) will in that case\nbe densified, which could significantly increase memory usage.\n\nProper signed distance fields don't have active tiles.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "dilate", label: "Dilation", num_components: 1, default_value: [3], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Specifies the number of voxels around an SDF narrow-band to be dilated."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "pattern", label: "Dilation Pattern", num_components: 1, default_value: ["NN6"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["NN6", "NN18", "NN26"], menu_labels: ["Faces", "Faces and Edges", "Faces, Edges and Vertices"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "The neighborhood pattern for the dilation operation\n\n__Faces__ is fastest. __Faces, Edges and Vertices__ is slowest\nbut can produce the best results for large dilations.\n__Faces and Edges__ is intermediate in speed and quality.\n"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbextrapolate',_hnt_SOP_vdbextrapolate)
    return _hnt_SOP_vdbextrapolate
}
        