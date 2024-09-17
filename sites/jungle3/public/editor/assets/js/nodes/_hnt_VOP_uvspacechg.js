
export default function (hou) {
    class _hnt_VOP_uvspacechg extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/uvspacechg';
        static category = '/VOP';
        static houdiniType = 'uvspacechg';
        static title = 'UV Space Change';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_uvspacechg.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "space", label: "Space", num_components: 1, default_value: ["object"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["object", "ndc", "world", "current"], menu_labels: ["Object", "Normalized Device Coordinates (NDC)", "World", "Current (Unchanged)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/uvspacechg',_hnt_VOP_uvspacechg)
    return _hnt_VOP_uvspacechg
}
        