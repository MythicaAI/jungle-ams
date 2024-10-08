
export default function (hou) {
    class _hnt_SOP_rbdmatchtransforms extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/RBD/rbdmatchtransforms';
        static category = '/SOP';
        static houdiniType = 'rbdmatchtransforms';
        static title = 'RBD Match Transforms';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_rbdmatchtransforms.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP'];
            const outputs = ['SOP', 'SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "reference", label: "Reference", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["Geometry", "Proxy Geometry"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "doconstraints", label: "Transform Constraints", default_value: true});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dorestlength", label: "Update Rest Length", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ doconstraints == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/RBD/rbdmatchtransforms',_hnt_SOP_rbdmatchtransforms)
    return _hnt_SOP_rbdmatchtransforms
}
        