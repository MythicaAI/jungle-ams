
export default function (hou) {
    class _hnt_VOP_mtlxUsdPrimvarReader extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Geometric/mtlxUsdPrimvarReader';
        static category = '/VOP';
        static houdiniType = 'mtlxUsdPrimvarReader';
        static title = 'MtlX USD Primvar Reader';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_mtlxUsdPrimvarReader.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "signature", label: "Signature", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_isparm": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "varname", label: "Varname", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_isparmuniform": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fallback", label: "Fallback", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fallback_boolean", label: "Fallback", default_value: false});
			hou_parm_template.setTags({"sidefx::shader_parmname": "fallback"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "fallback_integer", label: "Fallback", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"sidefx::shader_parmname": "fallback"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "fallback_string", label: "Fallback", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_parmname": "fallback"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fallback_vector2", label: "Fallback", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setTags({"sidefx::shader_parmname": "fallback"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fallback_vector3", label: "Fallback", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setTags({"sidefx::shader_parmname": "fallback"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fallback_vector4", label: "Fallback", num_components: 4, default_value: [0, 0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setTags({"sidefx::shader_parmname": "fallback"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Geometric/mtlxUsdPrimvarReader',_hnt_VOP_mtlxUsdPrimvarReader)
    return _hnt_VOP_mtlxUsdPrimvarReader
}
        