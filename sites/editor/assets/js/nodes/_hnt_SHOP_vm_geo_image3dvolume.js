
export default function (hou) {
    class _hnt_SHOP_vm_geo_image3dvolume extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/vm_geo_image3dvolume';
        static category = '/SHOP';
        static houdiniType = 'vm_geo_image3dvolume';
        static title = 'Image3D Volume Procedural';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_vm_geo_image3dvolume.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SHOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "file", label: "I3D File", num_components: 1, default_value: ["cloud.i3d"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/vm_geo_image3dvolume',_hnt_SHOP_vm_geo_image3dvolume)
    return _hnt_SHOP_vm_geo_image3dvolume
}
        