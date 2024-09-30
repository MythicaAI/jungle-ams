
export default function (hou) {
    class _hnt_VOP_pxrdisplayfiltercombiner extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrdisplayfiltercombiner';
        static category = '/VOP';
        static houdiniType = 'pxrdisplayfiltercombiner';
        static title = 'Pxr Display Filter Combiner';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrdisplayfiltercombiner.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "filter", label: "Filter", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setTags({"multistartoffset": "0", "script_ritype": "displayfilter[]"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "filter_#", label: "Filter #", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Display filter.");
			hou_parm_template2.setTags({"oprelative": ".", "script_ritype": "displayfilter"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrdisplayfiltercombiner',_hnt_VOP_pxrdisplayfiltercombiner)
    return _hnt_VOP_pxrdisplayfiltercombiner
}
        