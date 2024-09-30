
export default function (hou) {
    class _hnt_VOP_pxrshadedside extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrshadedside';
        static category = '/VOP';
        static houdiniType = 'pxrshadedside';
        static title = 'Pxr Shaded Side';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrshadedside.svg';
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
			let hou_parm_template = new hou.IntParmTemplate({name: "invert", label: "Invert", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("If the side we want is on the opposite side, turn this on to invert it.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrshadedside',_hnt_VOP_pxrshadedside)
    return _hnt_VOP_pxrshadedside
}
        