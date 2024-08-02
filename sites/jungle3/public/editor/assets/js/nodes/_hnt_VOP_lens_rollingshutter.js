
export default function (hou) {
    class _hnt_VOP_lens_rollingshutter extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/lens_rollingshutter';
        static category = '/VOP';
        static houdiniType = 'lens_rollingshutter';
        static title = 'Lens Rolling Shutter';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_lens_rollingshutter.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "shuttermode", label: "Rolling Shutter Direction", menu_items: ["none", "bottom_first", "top_first", "left_first", "right_first", "custom"], menu_labels: ["None", "Bottom First", "Top First", "Left First", "Right First", "Custom"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "ramp_rotation", label: "Ramp Rotation", num_components: 1, default_value: [0], min: 0, max: 360, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ shuttermode != custom }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "toffset_ramp", label: "Time Offset Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ shuttermode != custom }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"rampbasis_var": "ramp_basis", "rampkeys_var": "ramp_positions", "rampvalues_var": "ramp_values", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/lens_rollingshutter',_hnt_VOP_lens_rollingshutter)
    return _hnt_VOP_lens_rollingshutter
}
        