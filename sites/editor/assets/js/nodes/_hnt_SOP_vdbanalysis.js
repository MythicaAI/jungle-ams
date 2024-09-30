
export default function (hou) {
    class _hnt_SOP_vdbanalysis extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbanalysis';
        static category = '/SOP';
        static houdiniType = 'vdbanalysis';
        static title = 'VDB Analysis';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbanalysis.svg';
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
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of VDBs to analyze (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "operator", label: "Operator", menu_items: ["gradient", "curvature", "laplacian", "closestpoint", "divergence", "curl", "length", "normalize"], menu_labels: ["Gradient       (Scalar->Vector)", "Curvature     (Scalar->Scalar)", "Laplacian      (Scalar->Scalar)", "Closest Point (Scalar->Vector)", "Divergence    (Vector->Scalar)", "Curl             (Vector->Vector)", "Length         (Vector->Scalar)", "Normalize     (Vector->Vector)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "What to compute\n\nThe labels on the items in the menu indicate what datatype\nthe incoming VDB volume must be and the datatype of the output volume.\n\nGradient (scalar -> vector):\n    The gradient of a scalar field\n\nCurvature (scalar -> scalar):\n    The mean curvature of a scalar field\n\nLaplacian (scalar -> scalar):\n    The Laplacian of a scalar field\n\nClosest Point (scalar -> vector):\n    The location, at each voxel, of the closest point on a surface\n    defined by the incoming signed distance field\n\n    You can use the resulting field with the\n    [OpenVDB Advect Points node|Node:sop/DW_OpenVDBAdvectPoints]\n    to stick points to the surface.\n\nDivergence (vector -> scalar):\n    The divergence of a vector field\n\nCurl (vector -> vector):\n    The curl of a vector field\n\nMagnitude (vector -> scalar):\n    The length of the vectors in a vector field\n\nNormalize (vector -> vector):\n    The vectors in a vector field divided by their lengths\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "maskname", label: "Mask VDB", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A VDB from the second input used to define the iteration space (see [specifying volumes|/model/volumes#group])\n\nThe selected __Operator__ will be applied only where the mask VDB has [active|https://www.openvdb.org/documentation/doxygen/overview.html#subsecInactive] voxels or, if the mask VDB is a level set, only in the interior of the level set.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "outputname", label: "Output Name", num_components: 1, default_value: ["keep"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["keep", "append", "custom"], menu_labels: ["Keep Incoming VDB Names", "Append Operation Name", "Custom Name"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "How to name the generated VDB volumes\n\nIf you choose __Keep Incoming VDB Names__, the generated fields will replace the input fields."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "customname", label: "Custom Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "If this is not blank, the output VDB will use this name."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbanalysis',_hnt_SOP_vdbanalysis)
    return _hnt_SOP_vdbanalysis
}
        