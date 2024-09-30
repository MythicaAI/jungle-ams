
export default function (hou) {
    class _hnt_SOP_labs__rc_texture_model extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Pipeline/Integration/RealityCapture/labs::rc_texture_model';
        static category = '/SOP/labs';
        static houdiniType = 'labs::rc_texture_model';
        static title = 'Labs RC Texture Model';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__rc_texture_model.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "cook", label: "Texture Model"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().cook(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().cook(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "manual_mode", label: "Manual Mode", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "texturing_options", label: "Texturing Options", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "model_export_path", label: "Model Path", num_components: 1, default_value: ["$HIP/${HIPNAME}_textured.obj"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l hdk_texture_model model_export_path", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "filechooser_pattern": "*.obj"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "max_texture_res", label: "Max Texture Resolution", menu_items: ["0", "1", "2", "3", "4", "5", "6"], menu_labels: ["512x512", "1024x1024", "2048x2048", "4096x4096", "8192x8192", "16384x16384", "32768x32768"], default_value: 4, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "texturing_style", label: "Style", menu_items: ["0", "1"], menu_labels: ["Photo Consistency Based", "Visibility Based"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "_has_first_input", label: "_has_first_input", default_value: false, default_expression: "strcmp(opinputpath(\'.\', 0), \"\")", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "parm", label: "Label", num_components: 1, default_value: ["`chs(opinputpath(\".\",0) + \"/model_export_path\")`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "getlicense_button", label: "Get License"});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Pipeline/Integration/RealityCapture/labs::rc_texture_model',_hnt_SOP_labs__rc_texture_model)
    return _hnt_SOP_labs__rc_texture_model
}
        