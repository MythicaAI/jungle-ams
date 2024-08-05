
export default function (hou) {
    class _hnt_SHOP_ri_dynamicload extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/ri_dynamicload';
        static category = '/SHOP';
        static houdiniType = 'ri_dynamicload';
        static title = 'RSL Dynamic Load Procedural';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_ri_dynamicload.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "DynamicLoad", label: "Object File", num_components: 2, default_value: ["dynamic-object", "arguments"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/ri_dynamicload',_hnt_SHOP_ri_dynamicload)
    return _hnt_SHOP_ri_dynamicload
}
        