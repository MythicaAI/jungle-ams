
export default function (hou) {
    class _hnt_SOP_convertvdbpoints extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/convertvdbpoints';
        static category = '/SOP';
        static houdiniType = 'convertvdbpoints';
        static title = 'Convert VDB Points';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_convertvdbpoints.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "conversion", label: "Conversion", menu_items: ["vdb", "hdk", "mask", "count"], menu_labels: ["Pack Points into VDB Points", "Extract Points from VDB Points", "Generate Mask from VDB Points", "Points/Voxel Count from VDB Points"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Whether to pack points into a VDB Points primitive or to extract points from such a primitive or to generate a mask from the primitive or to count the number of points-per-voxel in the primitive"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDB Points primitives to be processed (see [specifying volumes|/model/volumes#group])"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "vdbpointsgroup", label: "VDB Points Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "The point group inside the VDB Points primitive to extract\n\nThis may be a normal point group that was collapsed into the VDB Points primitive when it was created, or a new group created with the [OpenVDB Points Group node|Node:sop/DW_OpenVDBPointsGroup]."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "name", label: "VDB Name", num_components: 1, default_value: ["points"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "outputname", label: "Output Name", num_components: 1, default_value: ["keep"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["keep", "append", "replace"], menu_labels: ["Keep Original Name", "Add Suffix", "Custom Name"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "Give the output VDB Points the same name as the input VDB, or add a suffix to the input name, or use a custom name."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "countname", label: "VDB Name", num_components: 1, default_value: ["count"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "maskname", label: "VDB Name", num_components: 1, default_value: ["mask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "The name of the VDB primitive to be created"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "keep", label: "Keep Original Geometry", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The incoming geometry will not be deleted if this is set."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "transform", label: "Define Transform", menu_items: ["targetpointspervoxel", "voxelsizeonly", "userefvdb"], menu_labels: ["Using Target Points Per Voxel", "Using Voxel Size Only", "To Match Reference VDB"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "How to construct the VDB Points primitive's transform\n\nAn important consideration is how big to make the grid cells\nthat contain the points.  Too large and there are too many points\nper cell and little optimization occurs.  Too small and the cost\nof the cells outweighs the points.\n\nUsing Target Points Per Voxel:\n    Automatically calculate a voxel size so that the given number\n    of points ends up in each voxel.  This will assume uniform\n    distribution of points.\n    \n    If an optional transform input is provided, use its rotation\n    and translation.\nUsing Voxel Size Only:\n    Provide an explicit voxel size, and if an optional transform input\n    is provided, use its rotation and translation.\nTo Match Reference VDB:\n    Use the complete transform provided from the second input.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "voxelsize", label: "Voxel Size", num_components: 1, default_value: [0.1], min: 1e-05, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "pointspervoxel", label: "Points per Voxel", num_components: 1, default_value: [8], min: 1, max: 16, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "refvdb", label: "Reference VDB", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "Which VDB in the second input to use as the reference for the transform\n\nIf this is not set, use the first VDB found.", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "poscompression", label: "Position Compression", menu_items: ["none", "int16", "int8"], menu_labels: ["None", "16-bit Fixed Point", "8-bit Fixed Point"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The position can be stored relative to the center of the voxel.\nThis means it does not require the full 32-bit float representation,\nbut can be quantized to a smaller fixed-point value."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "transferheading", label: "Attribute Transfer", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "mode", label: "Mode", menu_items: ["all", "spec"], menu_labels: ["All Attributes", "Specific Attributes"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "attrList", label: "Point Attributes", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "attribute#", label: "Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"sop_input": "0"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "valuecompression#", label: "Value Compression", menu_items: ["none", "truncate", "uvec", "ufxpt8", "ufxpt16"], menu_labels: ["None", "16-bit Truncate", "Unit Vector", "8-bit Unit", "16-bit Unit"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setTags({"houdini_utils::doc": "How to compress attribute values\n\nNone:\n    Values are stored with their full precision.\n\n16-bit Truncate:\n    Values are stored at half precision, truncating lower-order bits.\n\nUnit Vector:\n    Values are treated as unit vectors, so that if two components\n    are known, the third is implied and need not be stored.\n\n8-bit Unit:\n    Values are treated as lying in the 0..1 range and are quantized to 8 bits.\n\n16-bit Unit:\n    Values are treated as lying in the 0..1 range and are quantized to 16 bits.\n"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "blosccompression#", label: "Blosc Compression", default_value: false});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "attributespacer", label: "", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "normalcompression", label: "Normal Compression", menu_items: ["none", "uvec", "truncate"], menu_labels: ["None", "Unit Vector", "16-bit Truncate"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "colorcompression", label: "Color Compression", menu_items: ["none", "ufxpt16", "ufxpt8", "truncate"], menu_labels: ["None", "16-bit Unit", "8-bit Unit", "16-bit Truncate"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/convertvdbpoints',_hnt_SOP_convertvdbpoints)
    return _hnt_SOP_convertvdbpoints
}
        