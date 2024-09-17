
export default function (hou) {
    class _hnt_VOP_pbrdiffuse__2_0 extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Shading/pbrdiffuse::2.0';
        static category = '/VOP';
        static houdiniType = 'pbrdiffuse::2.0';
        static title = 'Physically Based Diffuse';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pbrdiffuse__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "model", label: "Diffuse Model", num_components: 1, default_value: ["diffuse"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["diffuse", "translucent"], menu_labels: ["Diffuse", "Translucent"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "label", label: "Component Label", num_components: 1, default_value: ["diffuse"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["diffuse", "specular", "reflect", "refract"], menu_labels: ["Diffuse", "Specular", "Reflect", "Refract"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "color", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "drough", label: "Diffuse Roughness", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ model == translucent }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Shading/pbrdiffuse::2.0',_hnt_VOP_pbrdiffuse__2_0)
    return _hnt_VOP_pbrdiffuse__2_0
}
        