
export default function (hou) {
    class _hnt_LOP_layerbreak extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/layerbreak';
        static category = '/LOP';
        static houdiniType = 'layerbreak';
        static title = 'Layer Break';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_layerbreak.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.SeparatorParmTemplate({name: "preseparator"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "helplabel", label: "Help Label", column_labels: ["The Layer Break node starts a new active sublayer that subsequent\nnodes will edit, and indicates all previous layers will be\ndiscarded when saving to disk."]});
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "postseparator"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/layerbreak',_hnt_LOP_layerbreak)
    return _hnt_LOP_layerbreak
}
        