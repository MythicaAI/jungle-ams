
export default function (hou) {
    class _hnt_SOP_vdbactivate extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbactivate';
        static category = '/SOP';
        static houdiniType = 'vdbactivate';
        static title = 'VDB Activate';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbactivate.svg';
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
			hou_parm_template.setTags({"houdini_utils::doc": "The vdb primitives to change the active region in.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "operation", label: "Operation", menu_items: ["union", "intersect", "subtract", "copy"], menu_labels: ["Union", "Intersect", "A - B", "Copy"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The vdb's current region is combined with the specified region\nin one of several ways.\n\nUnion:\n    All voxels that lie in the specified region will\n    be activated.  Other voxels will retain their original\n    activation states.\n\nIntersect:\n    Any voxel not in the specified region will be deactivated\n    and set to the background value.\n\nA - B:\n    Any voxel that is in the specified region will be deactivated\n    and set to the background value.\n\nCopy:\n    If a voxel is outside the specified region, it is set\n    to inactive and the background value.  If it is inside,\n    it is marked as active."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "setvalue", label: "Write Value", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "value", label: "Value", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "In the Union and Copy modes, when voxels are marked active they can also be\ninitialized to a constant value.  This will be done to all voxels that are\nmade active by the specification - including those that were already\nactive.\n\nThus, the Voxel Coordinats option will have the effect of setting a cube\narea to a constant value."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "regiontype", label: "Position", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "center", label: "Center", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setTags({"houdini_utils::doc": "This defines a cube in SOP space.  Any voxel that touches this cube will be part of the selected region."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "size", label: "Size", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setTags({"houdini_utils::doc": "This defines a cube in SOP space.  Any voxel that touches this cube will be part of the selected region."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "regiontype_1", label: "Voxel", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "min", label: "Min", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setTags({"houdini_utils::doc": "Defines minimum values of a box in voxel-coordinates.  This is\nan inclusive range, so includes the maximum voxel."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "max", label: "Max", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setTags({"houdini_utils::doc": "Defines maximum values of a box in voxel-coordinates.  This is\nan inclusive range, so includes the maximum voxel."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "regiontype_2", label: "Expand", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.IntParmTemplate({name: "expand", label: "Expand Voxels", num_components: 1, default_value: [1], min: null, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setTags({"houdini_utils::doc": "Expand the active area by at least the specified number of voxels.  Does not support\noperation or setting of values."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "expanddist", label: "Expand Distance", num_components: 1, default_value: [0], min: 0, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"houdini_utils::doc": "Expand the active area by at least the specified distance. Does not support operation or setting of values."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "expansionpattern", label: "Expansion Pattern", num_components: 1, default_value: ["face"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["face", "faceedge", "faceedgevertex"], menu_labels: ["Plus", "Diamond", "Box"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"houdini_utils::doc": "Specifies which nearby voxels are considered neighbors for expansion."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "regiontype_3", label: "Reference", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "boundgroup", label: "Bound Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"houdini_utils::doc": "Which primitives of the second input contribute to the bounding box\ncomputation.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usevdb", label: "Activate Using VDBs", default_value: false});
			hou_parm_template2.setTags({"houdini_utils::doc": "If turned on, only VDBs are used for activation.  They will activate\nwherever they themselves are already active.  This can be used to\ntransfer the active region from one VDB to another, even if they are\nnot aligned.\n\nIf turned off, the bounding box of the chosen primitives are used\ninstead and activated as if they were specified as World Positions."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usehull", label: "Activate Using Convex Hull", default_value: false});
			hou_parm_template2.setTags({"houdini_utils::doc": "If turned on, only convex hull fo points are used for activation."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "boundptgroup", label: "Convex Hull Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"houdini_utils::doc": "Which points of the second input contribute to the convex hull\ncomputation.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Points,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "voxeloffset", label: "Voxel Offset", num_components: 1, default_value: [0], min: null, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"houdini_utils::doc": "Expand the convex hull by the specified number of voxels."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "worldoffset", label: "World Offset", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"houdini_utils::doc": "Expand the convex hull by the specified distance."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "regiontype_4", label: "Deactivate", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "bgtolerance", label: "Deactivate Tolerance", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"houdini_utils::doc": "When deactivation of background voxels is enabled, voxel values are considered equal to the background if they differ by less than this tolerance."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "regiontype_5", label: "Fill SDF", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "prune", label: "Prune Tolerance", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"houdini_utils::doc": "After building the VDB grid there may be undetected constant tiles.\nThis tolerance is used to detect constant regions and collapse them.\nSuch areas that are within the background value will also be marked\ninactive."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "tolerance", label: "Prune Tolerance", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "After building the VDB grid there may be undetected constant tiles.\nThis tolerance is used to detect constant regions and collapse them.\nSuch areas that are within the background value will also be marked\ninactive."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbactivate',_hnt_SOP_vdbactivate)
    return _hnt_SOP_vdbactivate
}
        