
export default function (hou) {
    class _hnt_VOP_mtlxLamaEmission extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Lama/mtlxLamaEmission';
        static category = '/VOP';
        static houdiniType = 'mtlxLamaEmission';
        static title = 'MtlX Lama Emission';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_mtlxLamaEmission.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Main", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "color", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Lama/mtlxLamaEmission',_hnt_VOP_mtlxLamaEmission)
    return _hnt_VOP_mtlxLamaEmission
}
        