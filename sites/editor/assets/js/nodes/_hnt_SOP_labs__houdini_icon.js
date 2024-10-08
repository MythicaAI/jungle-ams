
export default function (hou) {
    class _hnt_SOP_labs__houdini_icon extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Mesh: Create/labs::houdini_icon';
        static category = '/SOP/labs';
        static houdiniType = 'labs::houdini_icon';
        static title = 'Labs Houdini Icon';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__houdini_icon.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP'];

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
    hou.registerType('SOP/Labs/Geometry/Mesh: Create/labs::houdini_icon',_hnt_SOP_labs__houdini_icon)
    return _hnt_SOP_labs__houdini_icon
}
        