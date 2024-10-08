
export default function (hou) {
    class _hnt_TOP_pythonmapper extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'TOP/Python/pythonmapper';
        static category = '/TOP';
        static houdiniType = 'pythonmapper';
        static title = 'Python Mapper';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_pythonmapper.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['TOP'];
            const outputs = ['TOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "savenodescript", label: "Save to Python Script"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("from pdg.hda import savehda;savehda.createSavePythonNodeDialog(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "from pdg.hda import savehda;savehda.createSavePythonNodeDialog(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "savenodehda", label: "Save to Digital Asset"});
			hou_parm_template.setHelp("Generate an HDA based on this node");
			hou_parm_template.setScriptCallback("from pdg.hda import savehda;savehda.createSaveHDADialog(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "from pdg.hda import savehda;savehda.createSaveHDADialog(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "callbacks", label: "Map Static", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "mapstatic", label: "onMapStatic Callback", num_components: 1, default_value: ["# Custom onMapStatic callback logic. The following global variables are available:\n#\n# self                -    A reference to the current pdg.Node instance\n# dependency_holder   -    Insert dependency pairs like so: dependency_holder.addDependency(downstream_item, upstream_item)\n# downstream_items    -    The list of downstream static work items\n# upstream_items      -    The list of upstream static work items\n"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "callbacks_1", label: "Map Dynamic", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "mapdynamic", label: "onMapDynamic Callback", num_components: 1, default_value: ["# Custom onMapDynamic callback logic. The following global variables are available:\n#\n# self                -    A reference to the current pdg.Node instance\n# dependency_holder   -    Insert dependency pairs like so: dependency_holder.addPair(downstream_item, upstream_item)\n# downstream_items    -    The list of downstream static work items\n# upstream_items      -    The list of upstream dynamic work items\n"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Python/pythonmapper',_hnt_TOP_pythonmapper)
    return _hnt_TOP_pythonmapper
}
        