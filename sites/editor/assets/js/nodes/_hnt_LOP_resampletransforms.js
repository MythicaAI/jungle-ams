
export default function (hou) {
    class _hnt_LOP_resampletransforms extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Utility/resampletransforms';
        static category = '/LOP';
        static houdiniType = 'resampletransforms';
        static title = 'Resample Transforms';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_resampletransforms.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "primpattern", label: "Primitives", num_components: 1, default_value: ["`lopinputprims('.', 0)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a transform1 primpattern", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import loputils\nrule = loputils.selectPrimsInParm(kwargs, True)\nprims = loputils.getAffectedPrims(kwargs['node'])\nif prims:\n    loputils.setPivotParmsToPrimTransform(\n            kwargs['node'], prims)\n", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane. Ctrl-click to select using the primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dt", label: "Time Sample Spacing", num_components: 1, default_value: [0.25], min: 0.001, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "includeoriginal", label: "Include Original Samples", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Utility/resampletransforms',_hnt_LOP_resampletransforms)
    return _hnt_LOP_resampletransforms
}
        