
export default function (hou) {
    class _hnt_COP2_reverse extends hou._HoudiniBase {
        static is_root = false;
        static id = 'COP2/Other/reverse';
        static category = '/COP2';
        static houdiniType = 'reverse';
        static title = 'Reverse';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_reverse.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Other/reverse',_hnt_COP2_reverse)
    return _hnt_COP2_reverse
}
        