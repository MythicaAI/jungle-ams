
export default function (hou) {
    class _hnt_VOP_pcfarthest extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pcfarthest';
        static category = '/VOP';
        static houdiniType = 'pcfarthest';
        static title = 'Point Cloud Farthest';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pcfarthest.svg';
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
			let hou_parm_template = new hou.IntParmTemplate({name: "handle", label: "Handle from pcopen", num_components: 1, default_value: [null], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pcfarthest',_hnt_VOP_pcfarthest)
    return _hnt_VOP_pcfarthest
}
        