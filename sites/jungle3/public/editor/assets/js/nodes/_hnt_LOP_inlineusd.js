
export default function (hou) {
    class _hnt_LOP_inlineusd extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/inlineusd';
        static category = '/LOP';
        static houdiniType = 'inlineusd';
        static title = 'Inline USD';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_inlineusd.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "allowediting", label: "Allow Following Nodes to Edit New Layer", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "usdsource", label: "USD Source", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import usdinlinelayermenu\n\nreturn usdinlinelayermenu.buildSnippetMenu('Lop/inline/usdsource')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"editor": "1", "editorlines": "20-50"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/inlineusd',_hnt_LOP_inlineusd)
    return _hnt_LOP_inlineusd
}
        