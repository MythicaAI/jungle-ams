
export default function (hou) {
    class _hnt_VOP_rayweight extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/rayweight';
        static category = '/VOP';
        static houdiniType = 'rayweight';
        static title = 'Ray Bounce Weight';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_rayweight.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP'];

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
    hou.registerType('VOP/Other/rayweight',_hnt_VOP_rayweight)
    return _hnt_VOP_rayweight
}
        