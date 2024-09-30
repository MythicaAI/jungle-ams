
export default function (hou) {
    class _hnt_VOP_kinefx__lookat extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/KineFX/kinefx::lookat';
        static category = '/VOP/kinefx';
        static houdiniType = 'kinefx::lookat';
        static title = 'Look At (KineFX)';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_kinefx__lookat.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "signature", label: "Signature", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_isparm": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "axes", label: "Axes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "lookataxis", label: "Look At Axis", menu_items: [], menu_labels: [], default_value: 2, icon_names: [], item_generator_script: "axes = [(\"0\", \"-X\"),(\"1\", \"-Y\"),(\"2\", \"-Z\"),(\"3\", \"X\"),(\"4\", \"Y\"),(\"5\", \"Z\")]\n\nreturn [item for sublist in axes for item in sublist]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template2.setScriptCallback("hou.pwd().parm(\"lookupaxis\").set(hou.pwd().evalParm(\"lookupaxis\"))");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback": "hou.pwd().parm(\"lookupaxis\").set(hou.pwd().evalParm(\"lookupaxis\"))", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "lookupaxis", label: "Up Axis", menu_items: [], menu_labels: [], default_value: 0, icon_names: [], item_generator_script: "axes = [(\"0\", \"-X\"),(\"1\", \"-Y\"),(\"2\", \"-Z\"),(\"3\", \"X\"),(\"4\", \"Y\"),(\"5\", \"Z\")]\nlookat = kwargs[\'node\'].evalParm(\"lookataxis\")\n\nmy_axes = [axes[i] for i in range(6) if i % 3 != lookat % 3]\nreturn [item for sublist in my_axes for item in sublist]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/KineFX/kinefx::lookat',_hnt_VOP_kinefx__lookat)
    return _hnt_VOP_kinefx__lookat
}
        