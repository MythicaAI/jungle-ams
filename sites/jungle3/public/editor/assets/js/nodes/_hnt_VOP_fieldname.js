
export default function (hou) {
    class _hnt_VOP_fieldname extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Pyro/fieldname';
        static category = '/VOP';
        static houdiniType = 'fieldname';
        static title = 'Field Name';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "name", label: "Field Name or Expr", num_components: 1, default_value: ["density"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dfltval", label: "Default Value", num_components: 4, default_value: [0, 0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "islegal", label: "Is Legal", num_components: 1, default_value: [0], default_expression: ["phm().needsparmvop(node('.'),evalParm('name'))"], default_expression_language: [hou.scriptLanguage.Python], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dummy == 1 }");
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "parmname", label: "Parm Name", num_components: 1, default_value: ["phm().makeparmname(node('.'),evalParm('name'))"], default_expression: ["phm().makeparmname(node('.'),evalParm('name'))"], default_expression_language: [hou.scriptLanguage.Python], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dummy == 1 }");
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "finalval", label: "Final Value", num_components: 1, default_value: ["phm().finalval(node('.'),evalParm('name'),evalParmTuple('dfltval'))"], default_expression: ["phm().finalval(node('.'),evalParm('name'),evalParmTuple('dfltval'))"], default_expression_language: [hou.scriptLanguage.Python], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dummy == 1 }");
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "final", label: "Final Assignment", num_components: 1, default_value: ["'vector4 fieldval = %s;' % evalParm('finalval')"], default_expression: ["'vector4 fieldval = %s;' % evalParm('finalval')"], default_expression_language: [hou.scriptLanguage.Python], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dummy == 1 }");
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "dummy", label: "dummy", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"export_disable": "1"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Pyro/fieldname',_hnt_VOP_fieldname)
    return _hnt_VOP_fieldname
}
        