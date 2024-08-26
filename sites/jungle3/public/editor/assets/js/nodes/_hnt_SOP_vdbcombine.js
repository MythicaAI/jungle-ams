
export default function (hou) {
    class _hnt_SOP_vdbcombine extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbcombine';
        static category = '/SOP';
        static houdiniType = 'vdbcombine';
        static title = 'VDB Combine';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbcombine.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "agroup", label: "Group A", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The VDBs to be used from the first input (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "bgroup", label: "Group B", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The VDBs to be used from the second input (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "collation", label: "Collation", num_components: 1, default_value: ["pairs"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["pairs", "awithfirstb", "flattena", "flattenbtoa", "flattenagroups"], menu_labels: ["Combine A/B Pairs", "Combine Each A With First B", "Flatten All A", "Flatten All B Into First A", "Flatten A Groups"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "The order in which to combine VDBs from the _A_ and/or _B_ groups\n\nCombine _A_/_B_ Pairs:\n    Combine pairs of _A_ and _B_ VDBs, in the order in which they appear\n    in their respective groups.\nCombine Each _A_ With First _B_:\n    Combine each _A_ VDB with the first _B_ VDB.\nFlatten All _A_:\n    Collapse all of the _A_ VDBs into a single output VDB.\nFlatten All _B_ Into First _A_:\n    Accumulate each _B_ VDB into the first _A_ VDB, producing a single output VDB.\nFlatten _A_ Groups:\n    Collapse VDBs within each _A_ group, producing one output VDB for each group.\n\n    Space-separated group patterns are treated as distinct groups in this mode.\n    For example, \"`@name=x* @name=y*`\" results in two output VDBs\n    (provided that there is at least one _A_ VDB whose name starts with `x`\n    and at least one whose name starts with `y`).\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "operation", label: "Operation", menu_items: ["copya", "copyb", "inverta", "add", "subtract", "multiply", "divide", "maximum", "minimum", "compatimesb", "apluscompatimesb", "sdfunion", "sdfintersect", "sdfdifference", "replacewithactive", "topounion", "topointersect", "topodifference"], menu_labels: ["Copy A", "Copy B", "Invert A", "Add", "Subtract", "Multiply", "Divide", "Maximum", "Minimum", "(1 - A) * B", "A + (1 - A) * B", "SDF Union", "SDF Intersection", "SDF Difference", "Replace A with Active B", "Activity Union", "Activity Intersection", "Activity Difference"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Each voxel that is active in either of the input VDBs\nwill be processed with this operation.\n\nCopy _A_:\n    Use _A_, ignore _B_.\n\nCopy _B_:\n    Use _B_, ignore _A_.\n\nInvert _A_:\n    Use 0 &minus; _A_.\n\nAdd:\n    Add the values of _A_ and _B_.\n\nNOTE:\n    Using this for fog volumes, which have density values between 0 and 1,\n    will push densities over 1 and cause a bright interface between the\n    input volumes when rendered.  To avoid this problem, try using the\n    _A_&nbsp;+&nbsp;(1&nbsp;&minus;&nbsp;_A_)&nbsp;&times;&nbsp;_B_\n    operation.\n\nSubtract:\n    Subtract the values of _B_ from the values of _A_.\n\nMultiply:\n    Multiply the values of _A_ and _B_.\n\nDivide:\n    Divide the values of _A_ by _B_.\n\nMaximum:\n    Use the maximum of each corresponding value from _A_ and _B_.\n\nNOTE:\n    Using this for fog volumes, which have density values between 0 and 1,\n    can produce a dark interface between the inputs when rendered, due to\n    the binary nature of choosing a value from either from _A_ or _B_.\n    To avoid this problem, try using the\n    (1&nbsp;&minus;&nbsp;_A_)&nbsp;&times;&nbsp;_B_ operation.\n\nMinimum:\n    Use the minimum of each corresponding value from _A_ and _B_.\n\n(1&nbsp;&minus;&nbsp;_A_)&nbsp;&times;&nbsp;_B_:\n    This is similar to SDF Difference, except for fog volumes,\n    and can also be viewed as \"soft cutout\" operation.\n    It is typically used to clear out an area around characters\n    in a dust simulation or some other environmental volume.\n\n_A_&nbsp;+&nbsp;(1&nbsp;&minus;&nbsp;_A_)&nbsp;&times;&nbsp;_B_:\n    This is similar to SDF Union, except for fog volumes, and\n    can also be viewed as a \"soft union\" or \"merge\" operation.\n    Consider using this over the Maximum or Add operations\n    for fog volumes.\n\nSDF Union:\n    Generate the union of signed distance fields _A_ and _B_.\n\nSDF Intersection:\n    Generate the intersection of signed distance fields _A_ and _B_.\n\nSDF Difference:\n    Remove signed distance field _B_ from signed distance field _A_.\n\nReplace _A_ with Active _B_:\n    Copy the active voxels of _B_ into _A_.\n\nActivity Union:\n    Make voxels active if they are active in either _A_ or _B_.\n\nActivity Intersection:\n    Make voxels active if they are active in both _A_ and _B_.\n\n    It is recommended to enable pruning when using this operation.\n\nActivity Difference:\n    Make voxels active if they are active in _A_ but not in _B_.\n\n    It is recommended to enable pruning when using this operation.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "amult", label: "A Multiplier", num_components: 1, default_value: [1], min: null, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bmult", label: "B Multiplier", num_components: 1, default_value: [1], min: null, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "resample", label: "Resample", menu_items: ["off", "btoa", "atob", "hitolo", "lotohi"], menu_labels: ["Off", "B to Match A", "A to Match B", "Higher-res to Match Lower-res", "Lower-res to Match Higher-res"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "resampleinterp", label: "Interpolation", menu_items: ["point", "linear", "quadratic"], menu_labels: ["Nearest", "Linear", "Quadratic"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The type of interpolation to be used when resampling one VDB to match the other's transform\n\nNearest neighbor interpolation is fast but can introduce noticeable sampling artifacts.  Quadratic interpolation is slow but high-quality. Linear interpolation is intermediate in speed and quality."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "deactivate", label: "Deactivate Background Voxels", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Deactivate active output voxels whose values equal the output VDB's background value."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bgtolerance", label: "Deactivate Tolerance", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "When deactivation of background voxels is enabled, voxel values are considered equal to the background if they differ by less than this tolerance."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "prunedegenerate", label: "Prune Degenerate Tiles", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "When SDF CSG operations result in a degenerancy, such as a VDB\nsubtracted from itself, clear the tile rather than having ghost\nbands.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "prune", label: "Prune", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Reduce the memory footprint of output VDBs that have (sufficiently large) regions of voxels with the same value.\n\nNOTE:\n    Pruning affects only the memory usage of a VDB.\n    It does not remove voxels, apart from inactive voxels\n    whose value is equal to the background."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "tolerance", label: "Prune Tolerance", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "When pruning is enabled, voxel values are considered equal if they differ by less than the specified tolerance."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "flood", label: "Signed-Flood-Fill Output SDFs", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Test inactive voxels to determine if they are inside or outside of an SDF and hence whether they should have negative or positive sign."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbcombine',_hnt_SOP_vdbcombine)
    return _hnt_SOP_vdbcombine
}
        