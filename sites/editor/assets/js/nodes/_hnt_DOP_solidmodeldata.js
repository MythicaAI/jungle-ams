
export default function (hou) {
    class _hnt_DOP_solidmodeldata extends hou._HoudiniBase {
        static is_root = false;
        static id = 'DOP/Other/solidmodeldata';
        static category = '/DOP';
        static houdiniType = 'solidmodeldata';
        static title = 'Solid Material Property Parameters';
        static icon = 'None';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidstiffness", label: "Stiffness Multiplier", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "solidstiffness", label: "Stiffness Multiplier", num_components: 1, default_value: [1000], min: 0, max: 1000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_soliddampingratio", label: "Damping Ratio", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "soliddampingratio", label: "Damping Ratio", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidmassdensity", label: "Mass Density", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "solidmassdensity", label: "Mass Density", num_components: 1, default_value: [1000], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": "kg1m-3"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidmaterialmodel", label: "Material Model", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "solidmaterialmodel", label: "Material Model", menu_items: ["stableneohookean", "corotatedlinear"], menu_labels: ["Stable Neo-Hookean Variant (Organic Tissue, Large deformations)", "Corotated Linear (Stiff Materials, Small Deformations)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidshapestiffness", label: "Shape Stiffness", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "solidshapestiffness", label: "Shape Stiffness", num_components: 1, default_value: [20], min: 0, max: 1000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": "kg1m-1s-2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidvolumestiffness", label: "Volume Stiffness", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "solidvolumestiffness", label: "Volume Stiffness", num_components: 1, default_value: [100], min: 0, max: 1000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": "kg1m-1s-2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidenableaniso", label: "Enable Anisotropy", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "solidenableaniso", label: "Enable Anisotropy", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidanisou", label: "Anisotropy U", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "solidanisou", label: "Anisotropy U", num_components: 1, default_value: [1], min: 0, max: 4, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidanisov", label: "Anisotropy V", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "solidanisov", label: "Anisotropy V", num_components: 1, default_value: [1], min: 0, max: 4, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_solidanisow", label: "Anisotropy W", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "solidanisow", label: "Anisotropy W", num_components: 1, default_value: [1], min: 0, max: 4, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"units": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "defaultparmop", label: "Default Operation", menu_items: ["initial", "always", "never"], menu_labels: ["Set Initial", "Set Always", "Set Never"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "sharedata", label: "Data Sharing", menu_items: ["off", "on", "onestep"], menu_labels: ["Do Not Share Data", "Share Data Across All Time", "Share Data In One Timestep"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "activation", label: "Activation", num_components: 1, default_value: [1], default_expression: ["constant()"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "activationrules", label: "Activation Rules", menu_items: [], menu_labels: [], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Mini, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "dataname", label: "Data Name", num_components: 1, default_value: ["SolidModelData"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "uniquedataname", label: "Unique Data Name", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Other/solidmodeldata',_hnt_DOP_solidmodeldata)
    return _hnt_DOP_solidmodeldata
}
        