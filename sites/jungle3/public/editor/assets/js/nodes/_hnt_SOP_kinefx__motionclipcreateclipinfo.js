
export default function (hou) {
    class _hnt_SOP_kinefx__motionclipcreateclipinfo extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Other/kinefx::motionclipcreateclipinfo';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::motionclipcreateclipinfo';
        static title = 'MotionClip Create Clip Info';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__motionclipcreateclipinfo.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "errormsg1", label: "Error Message", num_components: 1, default_value: ["The input does not have a 'clipinfo' detail attribute. One has been created using the 'time' primitive attribute."], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "severity1", label: "Severity", menu_items: ["message", "warn", "error"], menu_labels: ["Message", "Warning", "Error"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/kinefx::motionclipcreateclipinfo',_hnt_SOP_kinefx__motionclipcreateclipinfo)
    return _hnt_SOP_kinefx__motionclipcreateclipinfo
}
        