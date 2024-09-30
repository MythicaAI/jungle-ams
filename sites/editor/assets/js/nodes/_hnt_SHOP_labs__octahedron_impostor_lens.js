
export default function (hou) {
    class _hnt_SHOP_labs__octahedron_impostor_lens extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Labs/Rendering/Camera/labs::octahedron_impostor_lens';
        static category = '/SHOP/labs';
        static houdiniType = 'labs::octahedron_impostor_lens';
        static title = 'Labs Octahedron Lens';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_labs__octahedron_impostor_lens.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SHOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "xy_size", label: "xy_size", num_components: 1, default_value: [6], min: 1, max: 16, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "camera_width", label: "camera_width", num_components: 1, default_value: [0.25], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "camera_zoom", label: "camera_zoom", num_components: 1, default_value: [0.5], min: 0, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "imposter_mode", label: "imposter_mode", num_components: 1, default_value: ["hemi"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["hemi", "full"], menu_labels: ["Hemi-Octahedron", "Full-Octahedron"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "parm", label: "Label", num_components: 1, default_value: ["mode = hou.node(hou.node(\"../../\").parm(\"impostor_rop\").evalAsString()).parm(\"imposter_enum\").evalAsInt()\n\nif mode == 3:\n    return \'hemi\'\n\nelif mode == 4:\n    return \'full\'\n\nelse:\n    return \'hemi\'"], default_expression: ["mode = hou.node(hou.node(\"../../\").parm(\"impostor_rop\").evalAsString()).parm(\"imposter_enum\").evalAsInt()\n\nif mode == 3:\n    return \'hemi\'\n\nelif mode == 4:\n    return \'full\'\n\nelse:\n    return \'hemi\'"], default_expression_language: [hou.scriptLanguage.Python], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Labs/Rendering/Camera/labs::octahedron_impostor_lens',_hnt_SHOP_labs__octahedron_impostor_lens)
    return _hnt_SHOP_labs__octahedron_impostor_lens
}
        