
export default function (hou) {
    class _hnt_VOP_transform extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/transform';
        static category = '/VOP';
        static houdiniType = 'transform';
        static title = 'Transform';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_transform.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "from", label: "3D Entity Value", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "function", label: "Interpretation", num_components: 1, default_value: ["ptransform"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ptransform", "vtransform", "ntransform"], menu_labels: ["Position", "Direction Vector", "Normal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "fromspace", label: "From Space", num_components: 1, default_value: ["space:current"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: ["space:world", "space:camera", "space:object", "space:ndc", "space:current", "space:light", "space:lightndc", "/obj/geo1"], menu_labels: ["World Space", "Camera Space", "Object Space", "NDC Space", "Current Space", "Light Source Space", "Light Source NDC Space", "Object Name"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"opfilter": "!!OBJ!!", "oppathkeywords": "space:", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "tospace", label: "To Space", num_components: 1, default_value: ["space:object"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: ["space:world", "space:camera", "space:object", "space:ndc", "space:current", "space:light", "space:lightndc", "/obj/geo1"], menu_labels: ["World Space", "Camera Space", "Object Space", "NDC Space", "Current Space", "Light Source Space", "Light Source NDC Space", "Object Name"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"opfilter": "!!OBJ!!", "oppathkeywords": "space:", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/transform',_hnt_VOP_transform)
    return _hnt_VOP_transform
}
        