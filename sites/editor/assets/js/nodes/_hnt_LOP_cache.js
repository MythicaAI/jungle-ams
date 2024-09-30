
export default function (hou) {
    class _hnt_LOP_cache extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/cache';
        static category = '/LOP';
        static houdiniType = 'cache';
        static title = 'Cache';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_cache.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "behavior", label: "Cache Behavior", num_components: 1, default_value: ["cooked"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["all", "cooked", "uptocooked", "window"], menu_labels: ["Always Cache All Frames", "Cache Cooked Frames", "Cache Up To Cooked Frames", "Cache Rolling Window of Frames"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "f", label: "Start/End/Inc", num_components: 3, default_value: [1, 240, 1], default_expression: ["$FSTART", "$FEND", ""], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ behavior == window }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fextend", label: "Extend Cooked Cache", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ behavior == all } { behavior == window }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "window", label: "Before/After/Inc", num_components: 3, default_value: [0, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ behavior != window }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "trackprimexistence", label: "Track Primitive Existence to Set Visibility", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ behavior == cooked }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/cache',_hnt_LOP_cache)
    return _hnt_LOP_cache
}
        