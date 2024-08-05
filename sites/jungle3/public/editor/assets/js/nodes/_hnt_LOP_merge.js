
export default function (hou) {
    class _hnt_LOP_merge extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'LOP/Other/merge';
        static category = '/LOP';
        static houdiniType = 'merge';
        static title = 'Merge';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_merge.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "mergestyle", label: "Merge Style", num_components: 1, default_value: ["flattenloplayers"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["separate", "separateweakfiles", "separateweakfilesandsops", "flattened", "flattenintoinputlayer", "flatteninputs", "flattenloplayers"], menu_labels: ["Separate Layers", "Separate Layers, File Layers Weakest", "Separate Layers, File and SOP Layers Weakest", "Flatten Layers", "Flatten Into First Input Layer", "Flatten Each Input", "Simple Merge"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "alwaysstriplabel", label: "alwaysstriplabel", column_labels: ["Layers above layer breaks will be stripped"]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ mergestyle != flattened mergestyle != flatteninputs mergestyle != flattenloplayers }");
			hou_parm_template.setTags({"sidefx::look": "block"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "multistriplabel", label: "multistriplabel", column_labels: ["Layers above layer breaks will be stripped for all but the first input"]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ mergestyle != flattenintoinputlayer }");
			hou_parm_template.setTags({"sidefx::look": "block"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "striplayerbreaks", label: "Strip Layers Above Layer Breaks", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ mergestyle != separate mergestyle != separateweakfiles mergestyle != separateweakfilesandsops }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/merge',_hnt_LOP_merge)
    return _hnt_LOP_merge
}
        