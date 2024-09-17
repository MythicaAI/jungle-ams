
export default function (hou) {
    class _hnt_VOP_kma_rampconst extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Houdini/kma_rampconst';
        static category = '/VOP';
        static houdiniType = 'kma_rampconst';
        static title = 'Karma Ramp Const';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_kma_rampconst.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
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
			hou_parm_template = new hou.RampParmTemplate({name: "vramp", label: "Ramp", ramp_parm_type: hou.rampParmType.Color, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ signature == float }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == float }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"rampbasis_var": "vbasis", "rampkeys_var": "vkeys", "rampvalues_var": "vvalues", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "framp", label: "Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ signature == default }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ signature == default }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"rampbasis_var": "fbasis", "rampkeys_var": "fkeys", "rampvalues_var": "fvalues", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Houdini/kma_rampconst',_hnt_VOP_kma_rampconst)
    return _hnt_VOP_kma_rampconst
}
        