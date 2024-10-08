
export default function (hou) {
    class _hnt_SOP_labs__goz_import extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Integration/labs::goz_import';
        static category = '/SOP/labs';
        static houdiniType = 'labs::goz_import';
        static title = 'Labs GoZ Import';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "tool_name", label: "Tool Name", num_components: 1, default_value: ["${HIPNAME}_${OS}"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload"});
			hou_parm_template.setScriptCallback("hou.phm().load(kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.phm().load(kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "filecount", label: "GoZFiles", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.hide(true);
			let hou_parm_template2 = new hou.StringParmTemplate({name: "goz_file#", label: "GoZFile", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.hide(true);
			hou_parm_template2.setTags({"filechooser_mode": "read_and_write"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Integration/labs::goz_import',_hnt_SOP_labs__goz_import)
    return _hnt_SOP_labs__goz_import
}
        