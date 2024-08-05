
export default function (hou) {
    class _hnt_VOP_dirspacechg extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/dirspacechg';
        static category = '/VOP';
        static houdiniType = 'dirspacechg';
        static title = 'Direction Space Change';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_dirspacechg.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "type", label: "Convert", num_components: 1, default_value: ["nspace"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["nspace", "vspace"], menu_labels: ["Normal Vector", "Direction Other Than Normal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "space", label: "Space", num_components: 1, default_value: ["wo_"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ow_", "wo_", "tw_", "wt_"], menu_labels: ["Object To World", "World To Object", "Texture To World", "World To Texture"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dir", label: "Orientation", num_components: 3, default_value: [1, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/dirspacechg',_hnt_VOP_dirspacechg)
    return _hnt_VOP_dirspacechg
}
        