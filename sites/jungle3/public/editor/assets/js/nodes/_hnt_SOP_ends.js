
export default function (hou) {
    class _hnt_SOP_ends extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/ends';
        static category = '/SOP';
        static houdiniType = 'ends';
        static title = 'Ends';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_ends.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Source Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "pshapeu", label: "Preserve Shape U", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ closeu == sameclosure clampu == sameclamp }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "pshapev", label: "Preserve Shape V", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ closev == sameclosure clampv == sameclamp }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "closeu", label: "Close U", menu_items: ["sameclosure", "open", "closesharp", "closeround", "unroll", "unrollshared"], menu_labels: ["No change", "Open", "Close Straight", "Close Rounded", "Unroll with New Points", "Unroll with Shared Points"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "closev", label: "Close V", menu_items: ["sameclosure", "open", "closesharp", "closeround", "unroll", "unrollshared"], menu_labels: ["No change", "Open", "Close Straight", "Close Rounded", "Unroll with New Points", "Unroll with Shared Points"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "clampu", label: "Clamp U", menu_items: ["sameclamp", "clamp", "unclamp"], menu_labels: ["No change", "Clamp", "Unclamp"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "clampv", label: "Clamp V", menu_items: ["sameclamp", "clamp", "unclamp"], menu_labels: ["No change", "Clamp", "Unclamp"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/ends',_hnt_SOP_ends)
    return _hnt_SOP_ends
}
        