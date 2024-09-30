
export default function (hou) {
    class _hnt_SOP_posescope extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/posescope';
        static category = '/SOP';
        static houdiniType = 'posescope';
        static title = 'Pose Scope';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_posescope.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "attribname", label: "Attribute Name", num_components: 1, default_value: ["pose_scope"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"editor": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "items", label: "Items", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "scope#", label: "Scope #", default_value: true});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "group#", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "menu = []\n\ngeo = kwargs['node'].geometry()\nif not geo:\n    return menu\n\nfor group in geo.primGroups():\n    menu.append(group.name())\n    menu.append(group.name())\n\nreturn menu", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ scope# == 0 }");
			hou_parm_template2.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = hou.geometryType.Primitives\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "channels#", label: "Channels", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ scope# == 0 }");
			hou_parm_template2.setTags({"editor": "0", "editorlang": "", "editorlines": "5", "oprelative": "/", "script_action": "target = kwargs[\'parmtuple\'][0]\ninitial_parms = target.evalAsString().split(\" \")\nparms = hou.ui.selectParm(\n            category = hou.objNodeTypeCategory(),\n            bound_parms_only = False,\n            relative_to_node = kwargs[\'node\'],\n            message = \"Choose channels for posescope\",\n            title = \"Choose Channels\",\n            initial_parms = initial_parms)\ntarget.set(\" \".join(parms))", "script_action_help": "Open floating channel chooser", "script_action_icon": "BUTTONS_chooser_node"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pickscript#", label: "Pickscript", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ scope# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "label#", label: "Label", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ scope# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ pickscript# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "language#", label: "Language", menu_items: ["hscript", "python"], menu_labels: ["Hscript", "Python"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ scope# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ pickscript# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "hscript#", label: "Script", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ scope# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ language# == python } { pickscript# == 0 }");
			hou_parm_template2.setTags({"editor": "1", "editorlang": "hscript"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "python#", label: "Script", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ scope# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ language# == hscript } { pickscript# == 0 }");
			hou_parm_template2.setTags({"editor": "1", "editorlang": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/posescope',_hnt_SOP_posescope)
    return _hnt_SOP_posescope
}
        