
export default function (hou) {
    class _hnt_VOP_pxrlmmixer extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrlmmixer';
        static category = '/VOP';
        static houdiniType = 'pxrlmmixer';
        static title = 'PxrLM Mixer';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrlmmixer.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.LabelParmTemplate({name: "input0", label: "Input 0", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Parameters are combined from top down.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "input1", label: "Input 1", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Parameters are combined from top down.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "input2", label: "Input 2", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Parameters are combined from top down.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "input3", label: "Input 3", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Parameters are combined from top down.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "input4", label: "Input 4", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Parameters are combined from top down.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "input5", label: "Input 5", column_labels: [""]});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("Parameters are combined from top down.");
			hou_parm_template.setTags({"script_ritype": "struct"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrlmmixer',_hnt_VOP_pxrlmmixer)
    return _hnt_VOP_pxrlmmixer
}
        