
export default function (hou) {
    class _hnt_SHOP_vopsurfacetype extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = true;
        static id = 'SHOP/Other/vopsurfacetype';
        static category = '/SHOP';
        static houdiniType = 'vopsurfacetype';
        static title = 'VOP VEX Surface SHOP Type';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_vopsurfacetype.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "englishname", label: "SHOP Type Name", num_components: 1, default_value: ["VEX Builder Surface"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "tabmenuflag", label: "Show Operator in Tab Menu", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/vopsurfacetype',_hnt_SHOP_vopsurfacetype)
    return _hnt_SHOP_vopsurfacetype
}
        