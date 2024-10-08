
export default function (hou) {
    class _hnt_COP2_labs__dds_file extends hou._HoudiniBase {
        static is_root = false;
        static id = 'COP2/Labs/Pipeline/Import/labs::dds_file';
        static category = '/COP2/labs';
        static houdiniType = 'labs::dds_file';
        static title = 'Labs DDS File';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_labs__dds_file.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "image", label: "Image", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setHelp("Path to the DDS Image File ");
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().reloadCallback(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"filechooser_pattern": "*.dds", "script_callback": "hou.pwd().hdaModule().reloadCallback(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "override_size", label: "Override Size", default_value: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setHelp("Ignore the file native's size and use the specified one instead");
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().reloadCallback(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().reloadCallback(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "size", label: "Resolution", num_components: 2, default_value: [0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ override_size == 0 }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Labs/Pipeline/Import/labs::dds_file',_hnt_COP2_labs__dds_file)
    return _hnt_COP2_labs__dds_file
}
        