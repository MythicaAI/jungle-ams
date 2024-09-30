
export default function (hou) {
    class _hnt_LOP_bakeskinning extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Crowds/bakeskinning';
        static category = '/LOP';
        static houdiniType = 'bakeskinning';
        static title = 'Bake Skinning';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_bakeskinning.svg';
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
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Crowds/bakeskinning',_hnt_LOP_bakeskinning)
    return _hnt_LOP_bakeskinning
}
        