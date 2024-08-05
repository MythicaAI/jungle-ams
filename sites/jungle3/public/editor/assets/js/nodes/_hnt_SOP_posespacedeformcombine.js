
export default function (hou) {
    class _hnt_SOP_posespacedeformcombine extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin, hou._MultiInputMixin) {
        static is_root = false;
        static id = 'SOP/Other/posespacedeformcombine';
        static category = '/SOP';
        static houdiniType = 'posespacedeformcombine';
        static title = 'Pose-Space Deform Combine';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_posespacedeformcombine.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "useorient", label: "Use Orient", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/posespacedeformcombine',_hnt_SOP_posespacedeformcombine)
    return _hnt_SOP_posespacedeformcombine
}
        