
export default function (hou) {
    class _hnt_VOP_pxrcombinerlightfilter extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrcombinerlightfilter';
        static category = '/VOP';
        static houdiniType = 'pxrcombinerlightfilter';
        static title = 'Pxr Combiner Light Filter';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrcombinerlightfilter.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "mult", label: "Mult", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setTags({"multistartoffset": "0", "script_ritype": "lightfilter[]"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "mult_#", label: "Mult #", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("mult: Combining light filters by muliplying.");
			hou_parm_template2.setTags({"oprelative": ".", "script_ritype": "lightfilter"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "max", label: "Max", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setTags({"multistartoffset": "0", "script_ritype": "lightfilter[]"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "max_#", label: "Max #", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("max: Combining light filters by returning the maximum result.");
			hou_parm_template2.setTags({"oprelative": ".", "script_ritype": "lightfilter"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "min", label: "Min", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setTags({"multistartoffset": "0", "script_ritype": "lightfilter[]"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "min_#", label: "Min #", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("min: Combining light filters by returning the mininum result.");
			hou_parm_template2.setTags({"oprelative": ".", "script_ritype": "lightfilter"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "screen", label: "Screen", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setTags({"multistartoffset": "0", "script_ritype": "lightfilter[]"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "screen_#", label: "Screen #", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("screen: Combining light filters by returning the 'screen' result. Screen operation is similar to the max operation, but it combines gradients in a smoother way.");
			hou_parm_template2.setTags({"oprelative": ".", "script_ritype": "lightfilter"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrcombinerlightfilter',_hnt_VOP_pxrcombinerlightfilter)
    return _hnt_VOP_pxrcombinerlightfilter
}
        