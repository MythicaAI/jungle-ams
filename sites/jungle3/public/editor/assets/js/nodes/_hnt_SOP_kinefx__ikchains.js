
export default function (hou) {
    class _hnt_SOP_kinefx__ikchains extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Animation/Character/kinefx::ikchains';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::ikchains';
        static title = 'IK Chains';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__ikchains.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "ikchains", label: "IK Chains", folder_type: hou.folderType.TabbedMultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "root#", label: "Root Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soputils\nkwargs[\'geometrytype\'] = hou.geometryType.Points\nkwargs[\'inputindex\'] = 0\nsoputils.selectGroupParm(kwargs)\n\np = kwargs[\'parmtuple\'][0]\nn = kwargs[\'node\']\ng = n.inputGeometry(kwargs[\'inputindex\'])\nsel = hou.Selection(g, hou.geometryType.Points, p.evalAsString())\np.set(sel.points(g)[0].attribValue(\"name\"))", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "mid#", label: "Mid Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soputils\nkwargs[\'geometrytype\'] = hou.geometryType.Points\nkwargs[\'inputindex\'] = 0\nsoputils.selectGroupParm(kwargs)\n\np = kwargs[\'parmtuple\'][0]\nn = kwargs[\'node\']\ng = n.inputGeometry(kwargs[\'inputindex\'])\nsel = hou.Selection(g, hou.geometryType.Points, p.evalAsString())\np.set(sel.points(g)[0].attribValue(\"name\"))", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "tip#", label: "Tip Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soputils\nkwargs[\'geometrytype\'] = hou.geometryType.Points\nkwargs[\'inputindex\'] = 0\nsoputils.selectGroupParm(kwargs)\n\np = kwargs[\'parmtuple\'][0]\nn = kwargs[\'node\']\ng = n.inputGeometry(kwargs[\'inputindex\'])\nsel = hou.Selection(g, hou.geometryType.Points, p.evalAsString())\np.set(sel.points(g)[0].attribValue(\"name\"))", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm#_2"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "matchbyname#", label: "Match By Name", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "twist#", label: "Twist Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ matchbyname# == 1 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soputils\nkwargs[\'geometrytype\'] = hou.geometryType.Points\nkwargs[\'inputindex\'] = 1\nsoputils.selectGroupParm(kwargs)\n\np = kwargs[\'parmtuple\'][0]\nn = kwargs[\'node\']\ng = n.inputGeometry(kwargs[\'inputindex\'])\nsel = hou.Selection(g, hou.geometryType.Points, p.evalAsString())\np.set(sel.points(g)[0].attribValue(\"name\"))", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "goal#", label: "Goal Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ matchbyname# == 1 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soputils\nkwargs[\'geometrytype\'] = hou.geometryType.Points\nkwargs[\'inputindex\'] = 1\nsoputils.selectGroupParm(kwargs)\n\np = kwargs[\'parmtuple\'][0]\nn = kwargs[\'node\']\ng = n.inputGeometry(kwargs[\'inputindex\'])\nsel = hou.Selection(g, hou.geometryType.Points, p.evalAsString())\np.set(sel.points(g)[0].attribValue(\"name\"))", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "blend#", label: "Blend", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "orienttip#", label: "Orient Tip", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "stretch#", label: "Stretch", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Animation/Character/kinefx::ikchains',_hnt_SOP_kinefx__ikchains)
    return _hnt_SOP_kinefx__ikchains
}
        