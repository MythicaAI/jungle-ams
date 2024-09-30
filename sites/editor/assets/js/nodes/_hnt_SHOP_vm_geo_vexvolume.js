
export default function (hou) {
    class _hnt_SHOP_vm_geo_vexvolume extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/vm_geo_vexvolume';
        static category = '/SHOP';
        static houdiniType = 'vm_geo_vexvolume';
        static title = 'VEX Volume Procedural';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_vm_geo_vexvolume.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "shader", label: "Shader", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"opfilter": "!!SHOP/CVEX!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "divisions", label: "Octree Divisions", num_components: 1, default_value: [1], min: 1, max: 256, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/vm_geo_vexvolume',_hnt_SHOP_vm_geo_vexvolume)
    return _hnt_SHOP_vm_geo_vexvolume
}
        