
export default function (hou) {
    class _hnt_VOP_pxrattribute extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrattribute';
        static category = '/VOP';
        static houdiniType = 'pxrattribute';
        static title = 'Pxr Attribute';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrattribute.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "varname", label: "Variable Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "type", label: "Variable Type", num_components: 1, default_value: ["float"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["int", "float", "float2", "color", "point", "vector", "normal"], menu_labels: ["int", "float", "float2", "color", "point", "vector", "normal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrattribute',_hnt_VOP_pxrattribute)
    return _hnt_VOP_pxrattribute
}
        