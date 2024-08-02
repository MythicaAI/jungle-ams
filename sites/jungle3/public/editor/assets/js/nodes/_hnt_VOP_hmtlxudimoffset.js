
export default function (hou) {
    class _hnt_VOP_hmtlxudimoffset extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Texture2D/hmtlxudimoffset';
        static category = '/VOP';
        static houdiniType = 'hmtlxudimoffset';
        static title = 'MtlX UDIM Offset';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_hmtlxudimoffset.svg';
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
			let hou_parm_template = new hou.IntParmTemplate({name: "patch", label: "UDIM Patch", num_components: 1, default_value: [1001], min: 1001, max: 9999, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "in", label: "Texture Coordinates", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Texture2D/hmtlxudimoffset',_hnt_VOP_hmtlxudimoffset)
    return _hnt_VOP_hmtlxudimoffset
}
        