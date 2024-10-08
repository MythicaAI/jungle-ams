
export default function (hou) {
    class _hnt_TOP_texttocsv extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Files/texttocsv';
        static category = '/TOP';
        static houdiniType = 'texttocsv';
        static title = 'Text to CSV';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_texttocsv.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "node_options", label: "Node", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.IntParmTemplate({name: "parse_method", label: "Parse Method", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1", "2"], menu_labels: ["One Column Only", "Lexical Split", "Create Columns From Delimiter"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "remove_lines", label: "Remove Lines", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("A comma separated list of line numbers that should be ignored when parsing the text file.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "delimiter", label: "Delimiter", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ parse_method != 2 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "remove_empty_col", label: "Remove Empty Columns", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ parse_method != 2 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "output_filename", label: "Output Filename", num_components: 1, default_value: ["$HIP/output/$OS.`@pdg_index`.csv"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Files/texttocsv',_hnt_TOP_texttocsv)
    return _hnt_TOP_texttocsv
}
        