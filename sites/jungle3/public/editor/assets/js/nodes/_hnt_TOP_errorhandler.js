
export default function (hou) {
    class _hnt_TOP_errorhandler extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Other/errorhandler';
        static category = '/TOP';
        static houdiniType = 'errorhandler';
        static title = 'Error Handler';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_errorhandler.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['TOP'];

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
    hou.registerType('TOP/Other/errorhandler',_hnt_TOP_errorhandler)
    return _hnt_TOP_errorhandler
}
        