
export default function (hou) {
    class _hnt_SOP_heightfield_blur extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Environments/Terrain/heightfield_blur';
        static category = '/SOP';
        static houdiniType = 'heightfield_blur';
        static title = 'HeightField Blur';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_heightfield_blur.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "layer", label: "Blur Layer", num_components: 1, default_value: ["height"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils \n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "masklayer", label: "Mask Layer", num_components: 1, default_value: ["mask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils \n\nreturn terraintoolutils.buildNameMenu(kwargs['node'], input_num=1)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 0 }");
			hou_parm_template.setTags({"script_action": "import terraintoolutils\n\nterraintoolutils.createMaskPaint(kwargs)", "script_action_help": "Add a Mask Paint", "script_action_icon": "SOP_paint"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "maskaware", label: "Mask Aware Blur", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "iterations", label: "Iterations", num_components: 1, default_value: [10], min: 0, max: 1000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskaware == 0 } { hasinput(1) == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "method", label: "Method", menu_items: ["blur", "boxblur", "expand", "shrink", "sharpen"], menu_labels: ["Blur", "Box Blur", "Expand", "Shrink", "Sharpen"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskaware != 0 hasinput(1) == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "radius", label: "Radius", num_components: 1, default_value: [10], min: 0, max: 100, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskaware != 0 hasinput(1) == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "bordertype", label: "Override Border", menu_items: ["none", "constant", "repeat", "streak"], menu_labels: ["Use Volume", "Constant", "Repeat", "Streak"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskaware != 0 hasinput(1) == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "borderval", label: "Border Value", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bordertype == none }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskaware != 0 hasinput(1) == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "sharpenstrength", label: "Sharpen Strength", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ method != sharpen }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Environments/Terrain/heightfield_blur',_hnt_SOP_heightfield_blur)
    return _hnt_SOP_heightfield_blur
}
        