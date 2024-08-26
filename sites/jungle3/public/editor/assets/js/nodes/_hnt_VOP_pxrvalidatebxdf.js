
export default function (hou) {
    class _hnt_VOP_pxrvalidatebxdf extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrvalidatebxdf';
        static category = '/VOP';
        static houdiniType = 'pxrvalidatebxdf';
        static title = 'Pxr Validate Bxdf';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrvalidatebxdf.svg';
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
			let hou_parm_template = new hou.IntParmTemplate({name: "numSamples", label: "numSamples", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Controls the number of Bxdf samples to generate and evaluate per ray. The default is 4.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrvalidatebxdf',_hnt_VOP_pxrvalidatebxdf)
    return _hnt_VOP_pxrvalidatebxdf
}
        