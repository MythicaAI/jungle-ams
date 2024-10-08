
export default function (hou) {
    class _hnt_VOP_pxrroundcube extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrroundcube';
        static category = '/VOP';
        static houdiniType = 'pxrroundcube';
        static title = 'Pxr Round Cube';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrroundcube.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "filename", label: "Filename", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "firstChannel", label: "First Channel Offset", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("First channel offset to be looked up for Filename.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "filter", label: "Filter", menu_items: ["0", "1", "2", "3", "4", "5", "6", "7"], menu_labels: ["Nearest", "Box", "Bilinear", "Bspline", "Mitchell", "Catmullrom", "Gaussian", "Lagrangian"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "blur", label: "Blur", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "lerp", label: "Mip Interpolate", default_value: true});
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "missingColor", label: "Missing Color", num_components: 3, default_value: [1, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "linearize", label: "Linearize", default_value: false});
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "frequency", label: "Frequency", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invert", label: "Invert", default_value: false});
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "transition", label: "Transition", num_components: 1, default_value: [0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "tMin", label: "T Min", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "tMax", label: "T Max", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "manifoldN", label: "Normal Manifold", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrroundcube',_hnt_VOP_pxrroundcube)
    return _hnt_VOP_pxrroundcube
}
        