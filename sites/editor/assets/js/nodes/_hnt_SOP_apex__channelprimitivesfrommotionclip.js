
export default function (hou) {
    class _hnt_SOP_apex__channelprimitivesfrommotionclip extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Animation/APEX/apex::channelprimitivesfrommotionclip';
        static category = '/SOP/apex';
        static houdiniType = 'apex::channelprimitivesfrommotionclip';
        static title = 'Channel Primitives from MotionClip';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_apex__channelprimitivesfrommotionclip.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
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
    hou.registerType('SOP/Animation/APEX/apex::channelprimitivesfrommotionclip',_hnt_SOP_apex__channelprimitivesfrommotionclip)
    return _hnt_SOP_apex__channelprimitivesfrommotionclip
}
        