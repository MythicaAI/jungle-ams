
export default function (hou) {
    class _hnt_DOP_gasdsd extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'DOP/Other/gasdsd';
        static category = '/DOP';
        static houdiniType = 'gasdsd';
        static title = 'Gas DSD';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_gasdsd.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP'];
            const outputs = ['DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "parmop_d", label: "D Field", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "d", label: "D Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_ddot", label: "D' Field", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "ddot", label: "D' Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_curvature", label: "Curvature Field", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "curvature", label: "Curvature Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_curvatureadvected", label: "Advected Curvature Field", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "curvatureadvected", label: "Advected Curvature Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_c1", label: "Elasticity", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "c1", label: "Elasticity", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_c2", label: "Elastic Damping", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "c2", label: "Elastic Damping", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_c3", label: "Curvature Forcing", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "c3", label: "Curvature Forcing", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_c4", label: "Curvature Damping", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "c4", label: "Curvature Damping", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_c5", label: "C5", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "c5", label: "C5", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_mutheta", label: "Mu Theta", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "mutheta", label: "Mu Theta", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_dcj", label: "Detonation Speed", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dcj", label: "Detonation Speed", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_usetimestep", label: "Use Timestep", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usetimestep", label: "Use Timestep", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_timescale", label: "Time Scale", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "timescale", label: "Time Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "defaultparmop", label: "Default Operation", menu_items: ["initial", "always", "never"], menu_labels: ["Set Initial", "Set Always", "Set Never"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addaffectors", label: "Make Objects Mutual Affectors", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "dataname", label: "Data Name", num_components: 1, default_value: ["$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "uniquedataname", label: "Unique Data Name", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "solverperobject", label: "Solver Per Object", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Other/gasdsd',_hnt_DOP_gasdsd)
    return _hnt_DOP_gasdsd
}
        