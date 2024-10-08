
export default function (hou) {
    class _hnt_VOP_ocio_import extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/ocio_import';
        static category = '/VOP';
        static houdiniType = 'ocio_import';
        static title = 'OCIO Import';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_ocio_import.svg';
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
			hou_parm_template = new hou.StringParmTemplate({name: "space", label: "Color Space", num_components: 1, default_value: ["linear"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').ocioColorSpaceMenu()\")`\n", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "name", label: "Property Name", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["name", "family", "equalitygroup", "description", "isdata", "bitdepth", "allocation", "allocationvars"], menu_labels: ["Color Space Name (string)", "Family (string)", "The Equality Group (string)", "Description (string)", "Is Data (int)", "Bitdepth (string)", "Allocation - uniform or log2 (string)", "Allocation Variables (vector)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/ocio_import',_hnt_VOP_ocio_import)
    return _hnt_VOP_ocio_import
}
        