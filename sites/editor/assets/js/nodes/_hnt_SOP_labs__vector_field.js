
export default function (hou) {
    class _hnt_SOP_labs__vector_field extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Game Engine/labs::vector_field';
        static category = '/SOP/labs';
        static houdiniType = 'labs::vector_field';
        static title = 'Labs Vector Field Export';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__vector_field.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "render", label: "Render"});
			hou_parm_template.setScriptCallback("kwargs['node'].hdaModule().renderFile(kwargs['node'])");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "kwargs['node'].hdaModule().renderFile(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "outputFile", label: "Output File", num_components: 1, default_value: ["$HIP/export/${OS}.fga"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "input_type", label: "Input Type", menu_items: ["0", "1"], menu_labels: ["Volume", "Particles"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "velocity_volumes", label: "Velocity Volumes", num_components: 1, default_value: ["@name=vel.*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ input_type == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "velocity_attr", label: "Velocity Attribute", num_components: 1, default_value: ["v"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ input_type == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "override_res", label: "Override Resolution", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ input_type == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "div", label: "Sampling Divs", num_components: 3, default_value: [10, 10, 10], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ override_res == 0 input_type == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "visualise", label: "Visualise", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "npts", label: "Trail Count", num_components: 1, default_value: [1000], min: 1, max: 5000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ visualise == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Game Engine/labs::vector_field',_hnt_SOP_labs__vector_field)
    return _hnt_SOP_labs__vector_field
}
        