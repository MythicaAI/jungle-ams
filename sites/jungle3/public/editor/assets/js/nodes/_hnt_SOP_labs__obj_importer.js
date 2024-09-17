
export default function (hou) {
    class _hnt_SOP_labs__obj_importer extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Pipeline/Import/labs::obj_importer';
        static category = '/SOP/labs';
        static houdiniType = 'labs::obj_importer';
        static title = 'Labs OBJ Importer';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__obj_importer.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "fd_importsettings", label: "Import Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.ButtonParmTemplate({name: "reload", label: "Reload Geometry"});
			hou_parm_template2.setScriptCallback("kwargs['node'].hm().LoadMTL(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback": "kwargs['node'].hm().LoadMTL(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "sObjFile", label: "OBJ File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setScriptCallback("kwargs['node'].hm().LoadMTL(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"filechooser_mode": "read", "filechooser_pattern": "*.obj", "script_callback": "kwargs['node'].hm().LoadMTL(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bCustomMTLFile", label: "Custom MTL", default_value: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "sCustomMTL", label: "Label", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bCustomMTLFile == 0 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setScriptCallback("kwargs['node'].hm().LoadMTL(kwargs['node'])");
			hou_parm_template2.setTags({"filechooser_pattern": "*.mtl", "script_callback": "kwargs['node'].hm().LoadMTL(kwargs['node'])"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Pipeline/Import/labs::obj_importer',_hnt_SOP_labs__obj_importer)
    return _hnt_SOP_labs__obj_importer
}
        