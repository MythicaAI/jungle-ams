
export default function (hou) {
    class _hnt_SHOP_v_pointlight extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/v_pointlight';
        static category = '/SHOP';
        static houdiniType = 'v_pointlight';
        static title = 'Point Light';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_v_pointlight.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "lightcolor", label: "Light Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/v_pointlight',_hnt_SHOP_v_pointlight)
    return _hnt_SHOP_v_pointlight
}
        