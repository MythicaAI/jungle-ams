
export default function (hou) {
    class _hnt_SOP_crowdmotionpathevaluatecore extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/crowdmotionpathevaluatecore';
        static category = '/SOP';
        static houdiniType = 'crowdmotionpathevaluatecore';
        static title = 'Crowd MotionPath Evaluate Core';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "time", label: "Time", num_components: 1, default_value: [0], default_expression: ["$T"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/crowdmotionpathevaluatecore',_hnt_SOP_crowdmotionpathevaluatecore)
    return _hnt_SOP_crowdmotionpathevaluatecore
}
        