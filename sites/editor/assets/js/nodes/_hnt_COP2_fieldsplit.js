
export default function (hou) {
    class _hnt_COP2_fieldsplit extends hou._HoudiniBase {
        static is_root = false;
        static id = 'COP2/Other/fieldsplit';
        static category = '/COP2';
        static houdiniType = 'fieldsplit';
        static title = 'Field Split';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_fieldsplit.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Field Split", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "split", label: "Split", menu_items: ["frame2fields", "odd", "even"], menu_labels: ["Frame to 2 Fields", "Odd Fields", "Even Fields"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "fdominance", label: "Field Dominance", menu_items: ["odd", "even"], menu_labels: ["Odd Dominant  (Field 1)", "Even Dominant (Field 2)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Other/fieldsplit',_hnt_COP2_fieldsplit)
    return _hnt_COP2_fieldsplit
}
        