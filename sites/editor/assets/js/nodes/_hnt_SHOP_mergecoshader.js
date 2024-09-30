
export default function (hou) {
    class _hnt_SHOP_mergecoshader extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'SHOP/Other/mergecoshader';
        static category = '/SHOP';
        static houdiniType = 'mergecoshader';
        static title = 'RSL Merge Co-Shader';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_mergecoshader.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SHOP'];
            const outputs = ['SHOP'];

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
    hou.registerType('SHOP/Other/mergecoshader',_hnt_SHOP_mergecoshader)
    return _hnt_SHOP_mergecoshader
}
        