
export default function (hou) {
    class _hnt_SOP_vdbdiagnostics extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbdiagnostics';
        static category = '/SOP';
        static houdiniType = 'vdbdiagnostics';
        static title = 'VDB Diagnostics';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbdiagnostics.svg';
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
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDBs to be examined (see [specifying volumes|/model/volumes#group])"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usemask", label: "Mark in Mask VDB", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usepoints", label: "Mark as Points With Values", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "respectclass", label: "Respect VDB Class", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "operation"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "verify_fogvolume", label: "Validate Fog Volumes", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "verify_csg", label: "Validate for SDF CSG and Fracture", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "verify_filtering", label: "Validate for SDF Filtering and Renormalization", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "verify_advection", label: "Validate for SDF Advection and Morphing", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "general", label: "General Tests", column_labels: [""]});
			hou_parm_template.setTags({"houdini_utils::doc": "In the following, enable __Mark__ to add incorrect values to the output mask and/or point cloud, and enable __Fix__ to replace incorrect values."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_finite", label: "Finite Values                 ", default_value: true});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Verify that all values are finite and non-NaN.\n\nIf __Fix__ is enabled, replace incorrect values with the background value."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "id_finite", label: "Mark", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fix_finite", label: "Fix", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_background", label: "Uniform Background", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Verify that all inactive voxels are set to the background value.\n\nIf __Fix__ is enabled, replace incorrect values with the background value."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "id_background", label: "Mark", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fix_background", label: "Fix", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_valrange", label: "Values in Range           ", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Verify that all scalar voxel values and vector magnitudes are in the given range.\n\nIf __Fix__ is enabled, clamp values and vector magnitudes to the given range."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "id_valrange", label: "Mark", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fix_valrange", label: "Fix", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "label_valrange", label: "", column_labels: [""]});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "valrange", label: "Range", num_components: 2, default_value: [0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "ls_heading", label: "SDF Tests", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_symmetric", label: "Symmetric Narrow Band", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_bandwidth", label: "Minimum Band Width", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "label_bandwidth", label: "", column_labels: [""]});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "bandwidth", label: "Minimum Width in Voxels", num_components: 1, default_value: [3], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_surface", label: "Closed Surface", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_gradient", label: "Gradient Magnitude   ", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Verify that the level set gradient has magnitude one everywhere (within a given tolerance).\n\nIf __Fix__ is enabled, renormalize level sets."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "id_gradient", label: "Mark", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fix_gradient", label: "Fix", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "label_gradient", label: "", column_labels: [""]});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "gradienttolerance", label: "Tolerance", num_components: 1, default_value: [0.2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_activetiles", label: "Inactive Tiles                  ", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Verify that level sets have no active tiles.\n\nIf __Fix__ is enabled, deactivate all tiles."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "id_activetiles", label: "Mark", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fix_activetiles", label: "Fix", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_voxelsize", label: "Uniform Voxel Size", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "fog_heading", label: "Fog Volume Tests", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_backgroundzero", label: "Background Zero        ", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Verify that all inactive voxels in fog volumes have value zero.\n\nIf __Fix__ is enabled, set inactive voxels to zero."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "id_backgroundzero", label: "Mark", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fix_backgroundzero", label: "Fix", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "test_fogvalues", label: "Active Values in [0, 1]", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "Verify that all active voxels in fog volumes have values in the range &#91;0, 1&#93;.\n\nIf __Fix__ is enabled, clamp active voxels to the range &#91;0, 1&#93;."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "id_fogvalues", label: "Mark", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fix_fogvalues", label: "Fix", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbdiagnostics',_hnt_SOP_vdbdiagnostics)
    return _hnt_SOP_vdbdiagnostics
}
        