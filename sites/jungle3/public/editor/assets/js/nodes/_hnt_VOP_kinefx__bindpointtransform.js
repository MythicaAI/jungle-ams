
export default function (hou) {
    class _hnt_VOP_kinefx__bindpointtransform extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/KineFX/kinefx::bindpointtransform';
        static category = '/VOP/kinefx';
        static houdiniType = 'kinefx::bindpointtransform';
        static title = 'Bind Point Transform';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_kinefx__bindpointtransform.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "bind", label: "File", menu_items: ["opinput:0", "opinput:1", "opinput:2", "opinput:3"], menu_labels: ["First Input", "Second Input", "Third Input", "Fourth Input"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "pt", label: "Point Name", num_components: 1, default_value: ["`$OS`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/KineFX/kinefx::bindpointtransform',_hnt_VOP_kinefx__bindpointtransform)
    return _hnt_VOP_kinefx__bindpointtransform
}
        