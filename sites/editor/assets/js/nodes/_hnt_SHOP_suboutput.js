
export default function (hou) {
    class _hnt_SHOP_suboutput extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/suboutput';
        static category = '/SHOP';
        static houdiniType = 'suboutput';
        static title = 'Output Shaders';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_suboutput.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP', 'SHOP'];
            const outputs = [];

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
    hou.registerType('SHOP/Other/suboutput',_hnt_SHOP_suboutput)
    return _hnt_SHOP_suboutput
}
        