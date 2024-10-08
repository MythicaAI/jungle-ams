
export default function (hou) {
    class _hnt_SOP_rest extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/rest';
        static category = '/SOP';
        static houdiniType = 'rest';
        static title = 'Rest Position';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_rest.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "mode", label: "Mode", menu_items: ["store", "extract", "swap"], menu_labels: ["Store Rest", "Extract Rest", "Swap Rest"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "restattribname", label: "Rest Attrib", num_components: 1, default_value: ["rest"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "file", label: "Assign from File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 1 } { mode != store }");
			hou_parm_template.setTags({"filechooser_mode": "read"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "nml", label: "Rest Normals", menu_items: ["off", "poly", "on"], menu_labels: ["No Normals", "Add If Polygon/Mesh/Soup Exist", "Add Normals"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "normalattribname", label: "Rest Normal Attrib", num_components: 1, default_value: ["rnml"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ nml == off }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "xform", label: "Primitive Transforms", menu_items: ["off", "poly", "on"], menu_labels: ["No Transform Matrices", "Add If Transforming Primitives Exist", "Add Transform Matrices"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "xformattribname", label: "Transform Attrib", num_components: 1, default_value: ["restxform"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ xform == off }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "quadric", label: "Full Primitive Transforms", menu_items: ["off", "poly", "on"], menu_labels: ["No Full Transform Matrices", "Add If Transforming Primitives Exist", "Add Full Transform Matrices"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "quadricattribname", label: "Full Transform Attrib", num_components: 1, default_value: ["Pref"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ quadric == off }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "precision", label: "Precision", menu_items: ["auto", "32", "64"], menu_labels: ["Auto", "32-bit", "64-bit"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/rest',_hnt_SOP_rest)
    return _hnt_SOP_rest
}
        