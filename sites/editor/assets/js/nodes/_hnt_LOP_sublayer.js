
export default function (hou) {
    class _hnt_LOP_sublayer extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'LOP/Other/sublayer';
        static category = '/LOP';
        static houdiniType = 'sublayer';
        static title = 'Sublayer';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_sublayer.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "parentlayer_group", label: "Parent Layer", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible", "sidefx::header_parm": "loadpayloads"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "loadpayloads", label: "Load Payloads", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "setstagemetadata", label: "Copy Layer Metadata to Stage Root Layer", num_components: 1, default_value: ["auto"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["auto", "yes", "no"], menu_labels: ["Auto", "Yes", "No"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "editrootlayer", label: "Edit Root Layer", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "findsublayers", label: "Find Sublayers", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nmenu = loputils.createInputSubLayersMenu(kwargs['node'], 0,\n                kwargs['node'].parm('editrootlayer').eval())\nreturn menu", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "removefoundsublayers", label: "Remove Found Sublayers", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "composition_group", label: "Composition", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "sublayertype", label: "Sublayer Type", num_components: 1, default_value: ["filesandinputs"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["filesandinputs", "files", "inputs"], menu_labels: ["Sublayer Files and Inputs", "Sublayer Files", "Sublayer Inputs"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "handlemissingfiles", label: "Handle Missing Files", num_components: 1, default_value: ["error"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["error", "warn", "ignore", "allow"], menu_labels: ["Error for Missing Files", "Warn for Missing Files", "Ignore Missing Files", "Allow Missing Files on the Stage"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ sublayertype != files sublayertype != filesandinputs }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "positiontype", label: "Sublayer Position", num_components: 1, default_value: ["strongest"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["strongest", "weakest", "strongestfile", "strongestfound", "weakestfound", "index"], menu_labels: ["Strongest Position", "Weakest Position", "Strongest File Layer's Position", "Strongest Found Layer's Position", "Weakest Found Layer's Position", "Specific Index"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "positionindex", label: "Position Index", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ positiontype != index }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "files_separator"});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sublayertype != files sublayertype != filesandinputs }");
			hou_parm_template.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "num_files", label: "Number of Files", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sublayertype != files sublayertype != filesandinputs }");
			hou_parm_template2 = new hou.FolderParmTemplate({name: "sublayerfile_group#", label: "Sublayer File #", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_default": "1", "group_type": "collapsible", "sidefx::header_parm": "filepath#"});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "enable#", label: "Enable", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "filepath#", label: "File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template3.setTags({"filechooser_pattern": "*.usd, *.usda, *.usdc, *.usdz, *.mtlx"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "mute#", label: "Mute Layer", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "timeoffset#", label: "Time Offset (in Frames)", num_components: 1, default_value: [0], min: null, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "timescale#", label: "Time Scale", num_components: 1, default_value: [1], min: 0, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload Files"});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sublayertype != files sublayertype != filesandinputs }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "inputs_separator"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "enable", label: "Multi-inputs", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ sublayertype != inputs sublayertype != filesandinputs }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/sublayer',_hnt_LOP_sublayer)
    return _hnt_LOP_sublayer
}
        