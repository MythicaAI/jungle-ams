
export default function (hou) {
    class _hnt_SOP_kinefx__usdskinimport extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/kinefx::usdskinimport';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::usdskinimport';
        static title = 'USD Skin Import';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__usdskinimport.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "usdsource", label: "Source", menu_items: ["lop", "file"], menu_labels: ["LOP", "File"], default_value: 0, default_expression: "animation", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "loppath", label: "LOP Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usdsource != lop }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ usdsource != lop }");
			hou_parm_template.setTags({"opfilter": "!!LOP!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "usdfile", label: "USD File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usdsource != file }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ usdsource != file }");
			hou_parm_template.setTags({"filechooser_mode": "read"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload"});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usdsource != file }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ usdsource != file }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "skelrootpath", label: "SkelRoot Primitive Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_action": "import loputils\nloputils.selectPrimsInParmFromSource(kwargs, False)", "script_action_help": "Select primitives using the primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "prim"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "purpose", label: "Purpose", num_components: 1, default_value: ["proxy"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["proxy", "render", "guide"], menu_labels: ["proxy", "render", "guide"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "shapeattrib", label: "Shape Name Attribute", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/kinefx::usdskinimport',_hnt_SOP_kinefx__usdskinimport)
    return _hnt_SOP_kinefx__usdskinimport
}
        