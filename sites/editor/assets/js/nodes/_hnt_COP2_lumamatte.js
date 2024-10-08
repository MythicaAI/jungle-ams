
export default function (hou) {
    class _hnt_COP2_lumamatte extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'COP2/Keying/lumamatte';
        static category = '/COP2';
        static houdiniType = 'lumamatte';
        static title = 'LumaMatte';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_lumamatte.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "g0", label: "LumaMatte", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "range", label: "Luminance Range", num_components: 2, default_value: [0, 1], min: null, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "premult", label: "Redo Premultiply", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "premultscope", label: "Apply Premultiplies To", num_components: 1, default_value: ["C"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ premult == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Keying/lumamatte',_hnt_COP2_lumamatte)
    return _hnt_COP2_lumamatte
}
        