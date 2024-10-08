
export default function (hou) {
    class _hnt_SOP_solidfracture extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/Fracture/solidfracture';
        static category = '/SOP';
        static houdiniType = 'solidfracture';
        static title = 'Solid Fracture';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_solidfracture.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "partscale", label: "Part Scale", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "patternoffset", label: "Pattern Offset", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "visualizepieces", label: "Visualize Pieces", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/Fracture/solidfracture',_hnt_SOP_solidfracture)
    return _hnt_SOP_solidfracture
}
        