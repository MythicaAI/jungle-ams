
export default function (hou) {
    class _hnt_COP2_null extends hou._HoudiniBase {
        static is_root = false;
        static id = 'COP2/Other/null';
        static category = '/COP2';
        static houdiniType = 'null';
        static title = 'Null';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_null.svg';
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
    hou.registerType('COP2/Other/null',_hnt_COP2_null)
    return _hnt_COP2_null
}
        