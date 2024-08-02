
export default function (hou) {
    class _hnt_SHOP_rsl_voplighttype extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = true;
        static id = 'SHOP/Other/rsl_voplighttype';
        static category = '/SHOP';
        static houdiniType = 'rsl_voplighttype';
        static title = 'VOP RSL Light SHOP Type';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_rsl_voplighttype.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = [];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "englishname", label: "SHOP Type Name", num_components: 1, default_value: ["RSL Builder Light"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "tabmenuflag", label: "Show Operator in Tab Menu", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/rsl_voplighttype',_hnt_SHOP_rsl_voplighttype)
    return _hnt_SHOP_rsl_voplighttype
}
        