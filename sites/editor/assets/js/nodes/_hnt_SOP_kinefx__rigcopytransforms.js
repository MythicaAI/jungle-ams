
export default function (hou) {
    class _hnt_SOP_kinefx__rigcopytransforms extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Animation/Rigging/kinefx::rigcopytransforms';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::rigcopytransforms';
        static title = 'Rig Copy Transforms';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__rigcopytransforms.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "from kinefx.ui import jointselection\nreturn jointselection.buildTransformMenu(kwargs['node'], add_prefix=True, is_motionclip=False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "from kinefx.ui import rigtreeutils\nrigtreeutils.selectPointGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "mapusing", label: "Map Using", menu_items: ["mappingattrib", "matchattrib"], menu_labels: ["Mapping Attribute", "Match By Attribute"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "attribtomatch", label: "Attribute To Match", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\'].node(\"IN\")\ngeo = node.geometry()\n\npointattribs = geo.generateAttribMenu(attrib_type=hou.attribType.Point,\n    max_size=1, case_sensitive=True, pattern=\"*\")\n \nreturn pointattribs", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ mapusing == mappingattrib }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "mappingattribname", label: "Mapping Attribute Name", num_components: 1, default_value: ["mapping"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\'].node(\"IN\")\ngeo = node.geometry()\n\npointattribs = geo.generateAttribMenu(attrib_type=hou.attribType.Point,\n    data_type=hou.attribData.Dict,\n    case_sensitive=True, pattern=\"*\")\n \nreturn pointattribs", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ mapusing == matchattrib }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "restattrib", label: "Rest Pose Attribute", num_components: 1, default_value: ["rest_transform"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\'].node(\"IN\")\ngeo = node.geometry()\n\npointattribs = geo.generateAttribMenu(attrib_type=hou.attribType.Point,\n    data_type=hou.attribData.Float, min_size=16,\n    case_sensitive=True, pattern=\"*\")\n \nreturn pointattribs", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Animation/Rigging/kinefx::rigcopytransforms',_hnt_SOP_kinefx__rigcopytransforms)
    return _hnt_SOP_kinefx__rigcopytransforms
}
        