
export default function (hou) {
    class _hnt_SHOP_ri_constant extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/ri_constant';
        static category = '/SHOP';
        static houdiniType = 'ri_constant';
        static title = 'RSL Constant';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_ri_constant.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
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
    hou.registerType('SHOP/Other/ri_constant',_hnt_SHOP_ri_constant)
    return _hnt_SHOP_ri_constant
}
        