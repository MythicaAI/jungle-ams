
export default function (hou) {
    class _hnt_VOP_composite extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/composite';
        static category = '/VOP';
        static houdiniType = 'composite';
        static title = 'Composite';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "op", label: "Operation", num_components: 1, default_value: ["AoverB"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["A", "B", "AoverB", "AinsideB", "AoutsideB", "AatopB", "AxorB", "multiply", "screen", "overlay", "darken", "lighten", "colordodge", "colorburn", "hardlight", "softlight", "difference", "exclusion"], menu_labels: ["A Pass Through", "B Pass Through", "A over B", "A inside B", "A outside B", "A atop B", "A xor B", "A multiply B", "A screen B", "A overlay B", "Darken", "Lighten", "Color Dodge", "Color Burn", "Hard Light", "Soft Light", "Difference", "Exclusion"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "A", label: "A", num_components: 3, default_value: [0, 0, 0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "Aa", label: "A Alpha", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "B", label: "B", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "Ba", label: "B Alpha", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/composite',_hnt_VOP_composite)
    return _hnt_VOP_composite
}
        