
export default function (hou) {
    class _hnt_SOP_kinefx__computetransform extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/kinefx::computetransform';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::computetransform';
        static title = 'Compute Transform';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__computetransform.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "mode", label: "Mode", menu_items: ["world", "local", "auto"], menu_labels: ["Compute World from Local", "Compute Local from World", "Auto"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "constrainedgroup", label: "Constrained Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ mode != world }");
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = hou.geometryType.Points\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "outputattributes_folder", label: "Output Attributes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputlocaltransform", label: "Local Transform", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ mode != world }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputeffectivelocaltransform", label: "Effective Local Transform", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/kinefx::computetransform',_hnt_SOP_kinefx__computetransform)
    return _hnt_SOP_kinefx__computetransform
}
        