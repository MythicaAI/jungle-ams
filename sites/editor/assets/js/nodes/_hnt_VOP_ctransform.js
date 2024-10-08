
export default function (hou) {
    class _hnt_VOP_ctransform extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/ctransform';
        static category = '/VOP';
        static houdiniType = 'ctransform';
        static title = 'Color Transform';
        static icon = 'None';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "from", label: "Source Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "fromspace", label: "From Space", num_components: 1, default_value: ["cspace:rgb"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["cspace:rgb", "cspace:hsl", "cspace:hsv", "cspace:XYZ", "cspace:Lab", "cspace:tmi"], menu_labels: ["RGB", "HSL", "HSV", "XYZ", "Lab", "TMI"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "tospace", label: "To Space", num_components: 1, default_value: ["cspace:XYZ"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["cspace:rgb", "cspace:hsl", "cspace:hsv", "cspace:XYZ", "cspace:Lab", "cspace:tmi"], menu_labels: ["RGB", "HSL", "HSV", "XYZ", "Lab", "TMI"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/ctransform',_hnt_VOP_ctransform)
    return _hnt_VOP_ctransform
}
        