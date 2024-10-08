
export default function (hou) {
    class _hnt_COP2_vopcop2gentype extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = true;
        static id = 'COP2/Other/vopcop2gentype';
        static category = '/COP2';
        static houdiniType = 'vopcop2gentype';
        static title = 'VOP COP2 Generator Type';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_vopcop2gentype.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "englishname", label: "COP2 Type Name", num_components: 1, default_value: ["VEX Builder COP2 Generator"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "tabmenuflag", label: "Show Operator in Tab Menu", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Other/vopcop2gentype',_hnt_COP2_vopcop2gentype)
    return _hnt_COP2_vopcop2gentype
}
        