
export default function (hou) {
    class _hnt_SOP_python extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/python';
        static category = '/SOP';
        static houdiniType = 'python';
        static title = 'Python';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_python.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "python", label: "Python Code", num_components: 1, default_value: ["node = hou.pwd()\ngeo = node.geometry()\n\n# Add code to modify contents of geo.\n# Use drop down menu to select examples.\n"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import pythonscriptmenu\n\nreturn pythonscriptmenu.buildSnippetMenu('Sop/pythonscript/python')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"editor": "1", "editorlang": "python", "editorlines": "20-50"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "maintainstate", label: "Maintain State", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/python',_hnt_SOP_python)
    return _hnt_SOP_python
}
        