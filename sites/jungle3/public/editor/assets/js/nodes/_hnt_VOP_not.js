
export default function (hou) {
    class _hnt_VOP_not extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/not';
        static category = '/VOP';
        static houdiniType = 'not';
        static title = 'Not';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_not.svg';
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
			let hou_parm_template = new hou.ToggleParmTemplate({name: "bitwise", label: "Bitwise Operation", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/not',_hnt_VOP_not)
    return _hnt_VOP_not
}
        