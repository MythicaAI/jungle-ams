
export default function (hou) {
    class _hnt_DRIVER_labs__json_exporter__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DRIVER/Labs/Pipeline/Export/labs::json_exporter::1.0';
        static category = '/DRIVER/labs';
        static houdiniType = 'labs::json_exporter::1.0';
        static title = 'Labs JSON Exporter';
        static icon = '/editor/assets/imgs/nodes/_hnt_DRIVER_labs__json_exporter__1_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['DRIVER'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "execute", label: "Render"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "renderdialog", label: "Controls..."});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "export_node", label: "Export Node", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Export a CSV file to the specified location.");
			hou_parm_template.setTags({"opfilter": "!!SOP!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "json_path", label: "JSON Path", num_components: 1, default_value: ["$HIP/export/export.json"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setHelp("Location and name to save the CSV file.");
			hou_parm_template.setTags({"filechooser_pattern": "*.json"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "generatename", label: "Generate Name", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "filtered", label: "Filtered Export", default_value: false});
			hou_parm_template.setHelp("When enabled use the following multiparm to define which attributes to export, otherwise just export @P.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "entries", label: "Export Attributes", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ filtered == 0 }");
			let hou_parm_template2 = new hou.StringParmTemplate({name: "attribute_#", label: "Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DRIVER/Labs/Pipeline/Export/labs::json_exporter::1.0',_hnt_DRIVER_labs__json_exporter__1_0)
    return _hnt_DRIVER_labs__json_exporter__1_0
}
        