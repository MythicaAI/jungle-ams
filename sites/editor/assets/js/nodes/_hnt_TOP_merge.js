
export default function (hou) {
    class _hnt_TOP_merge extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'TOP/Utility/merge';
        static category = '/TOP';
        static houdiniType = 'merge';
        static title = 'Merge';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_merge.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "pdg_workitemgeneration", label: "Generate When", menu_items: [], menu_labels: [], default_value: 2, icon_names: [], item_generator_script: "import pdg\nreturn pdg.generateWhenMenu()", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "keepfailed", label: "Merge Failed Work Items", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "extrainputs", label: "Extra Inputs", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "enableextrainput#", label: "Enable Extra Input #", default_value: true});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "extrainput#", label: "Extra Input #", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enableextrainput# == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"opfilter": "!!TOP!!", "oprelative": ".", "pdg::expandname": "", "pdg::extrainput": "", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Utility/merge',_hnt_TOP_merge)
    return _hnt_TOP_merge
}
        