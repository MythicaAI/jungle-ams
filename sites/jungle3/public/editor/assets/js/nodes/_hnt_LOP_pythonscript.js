
export default function (hou) {
    class _hnt_LOP_pythonscript extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/pythonscript';
        static category = '/LOP';
        static houdiniType = 'pythonscript';
        static title = 'Python Script';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_pythonscript.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "python", label: "Python Code", num_components: 1, default_value: ["node = hou.pwd()\nstage = node.editableStage()\n\n# Add code to modify the stage.\n# Use drop down menu to select examples.\n"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import pythonscriptmenu\n\nreturn pythonscriptmenu.buildSnippetMenu('Lop/pythonscript/python')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"editor": "1", "editorlang": "python", "editorlines": "20-50"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "maintainstate", label: "Maintain State", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/pythonscript',_hnt_LOP_pythonscript)
    return _hnt_LOP_pythonscript
}
        