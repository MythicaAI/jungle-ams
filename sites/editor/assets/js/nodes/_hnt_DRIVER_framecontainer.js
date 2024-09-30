
export default function (hou) {
    class _hnt_DRIVER_framecontainer extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin, hou._MultiInputMixin) {
        static is_root = false;
        static id = 'DRIVER/Other/framecontainer';
        static category = '/DRIVER';
        static houdiniType = 'framecontainer';
        static title = 'Frame Container';
        static icon = '/editor/assets/imgs/nodes/_hnt_DRIVER_framecontainer.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DRIVER'];
            const outputs = ['DRIVER'];

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
    hou.registerType('DRIVER/Other/framecontainer',_hnt_DRIVER_framecontainer)
    return _hnt_DRIVER_framecontainer
}
        