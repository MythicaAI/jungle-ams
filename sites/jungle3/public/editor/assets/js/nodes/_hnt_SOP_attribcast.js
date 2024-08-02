
export default function (hou) {
    class _hnt_SOP_attribcast extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/attribcast';
        static category = '/SOP';
        static houdiniType = 'attribcast';
        static title = 'Attribute Cast';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_attribcast.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Global Precision", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "preferredprecision", label: "Set Preferred Precision", num_components: 1, default_value: ["unchanged"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["unchanged", "32", "64"], menu_labels: ["Unchanged", "32-bit", "64-bit"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Attribute Casts", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "numcasts", label: "Number of Casts", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "class#", label: "Class", num_components: 1, default_value: ["point"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["detail", "primitive", "point", "vertex"], menu_labels: ["Detail", "Primitive", "Point", "Vertex"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "attribs#", label: "Attributes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "precision#", label: "Precision", num_components: 1, default_value: ["fpreal32"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["uint8", "int8", "int16", "int32", "int64", "fpreal16", "fpreal32", "fpreal64", "preferred"], menu_labels: ["8-bit unsigned integer", "8-bit signed integer", "16-bit integer", "32-bit integer", "64-bit integer", "16-bit float", "32-bit float", "64-bit float", "Convert to Preferred"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/attribcast',_hnt_SOP_attribcast)
    return _hnt_SOP_attribcast
}
        