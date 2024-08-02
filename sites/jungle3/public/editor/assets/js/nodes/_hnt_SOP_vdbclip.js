
export default function (hou) {
    class _hnt_SOP_vdbclip extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbclip';
        static category = '/SOP';
        static houdiniType = 'vdbclip';
        static title = 'VDB Clip';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbclip.svg';
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
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of VDBs from the first input to be clipped (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "inside", label: "Keep Inside", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "If enabled, keep voxels that lie inside the clipping region, otherwise keep voxels that lie outside the clipping region."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "clipper", label: "Clip To", num_components: 1, default_value: ["geometry"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["camera", "geometry", "mask"], menu_labels: ["Camera", "Geometry Bounding Box", "Mask VDB"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How to define the clipping region\n\nCamera:\n    Use a camera frustum as the clipping region.\nGeometry:\n    Use the bounding box of geometry from the second input as the clipping region.\nMask VDB:\n    Use the active voxels of a VDB volume from the second input as a clipping mask.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "mask", label: "Mask VDB", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A VDB from the second input whose active voxels are to be used as a clipping mask (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "camera", label: "Camera", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "The path to the camera whose frustum is to be used as a clipping region (e.g., `/obj/cam1`)", "opfilter": "!!OBJ/CAMERA!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "setnear", label: "", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "near", label: "Near Clipping", num_components: 1, default_value: [0.001], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "The position of the near clipping plane\n\nIf enabled, this setting overrides the camera's clipping plane."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "setfar", label: "", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "far", label: "Far Clipping", num_components: 1, default_value: [10000], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "The position of the far clipping plane\n\nIf enabled, this setting overrides the camera's clipping plane."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "setpadding", label: "", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "padding", label: "Padding", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"houdini_utils::doc": "Padding in world units to be added to the clipping region\n\nNegative values shrink the clipping region.\n\nNonuniform padding is not supported when clipping to a VDB volume.\nThe mask volume will be dilated or eroded uniformly by the _x_-axis padding value."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbclip',_hnt_SOP_vdbclip)
    return _hnt_SOP_vdbclip
}
        