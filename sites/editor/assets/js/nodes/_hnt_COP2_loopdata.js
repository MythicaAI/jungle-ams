
export default function (hou) {
    class _hnt_COP2_loopdata extends hou._HoudiniBase {
        static is_root = false;
        static id = 'COP2/Other/loopdata';
        static category = '/COP2';
        static houdiniType = 'loopdata';
        static title = 'Loop Data';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_loopdata.svg';
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
    hou.registerType('COP2/Other/loopdata',_hnt_COP2_loopdata)
    return _hnt_COP2_loopdata
}
        