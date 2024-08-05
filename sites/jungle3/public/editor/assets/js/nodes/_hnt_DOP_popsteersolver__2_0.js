
export default function (hou) {
    class _hnt_DOP_popsteersolver__2_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/POPs/popsteersolver::2.0';
        static category = '/DOP';
        static houdiniType = 'popsteersolver::2.0';
        static title = 'POP Steer Solver';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_popsteersolver__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP'];
            const outputs = ['DOP', 'DOP', 'DOP', 'DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "maxforce", label: "Max Force", num_components: 1, default_value: [null], min: null, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/POPs/popsteersolver::2.0',_hnt_DOP_popsteersolver__2_0)
    return _hnt_DOP_popsteersolver__2_0
}
        