
export default function (hou) {
    class _hnt_SOP_kinefx__motionclipmerge extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/kinefx::motionclipmerge';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::motionclipmerge';
        static title = 'Motion Clip Merge';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__motionclipmerge.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "clipname", label: "Clip Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "merge1", label: "Merge Input 1", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "merge2", label: "Merge Input 2", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/kinefx::motionclipmerge',_hnt_SOP_kinefx__motionclipmerge)
    return _hnt_SOP_kinefx__motionclipmerge
}
        