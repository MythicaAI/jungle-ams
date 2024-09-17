
export default function (hou) {
    class _hnt_VOP_osd_patchcount extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/osd_patchcount';
        static category = '/VOP';
        static houdiniType = 'osd_patchcount';
        static title = 'OpenSubdiv Patch Count';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "input", label: "Geometry File", num_components: 1, default_value: ["$HH/geo/defgeo.bgeo"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/osd_patchcount',_hnt_VOP_osd_patchcount)
    return _hnt_VOP_osd_patchcount
}
        