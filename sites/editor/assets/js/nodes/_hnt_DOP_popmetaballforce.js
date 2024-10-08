
export default function (hou) {
    class _hnt_DOP_popmetaballforce extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/POPs/popmetaballforce';
        static category = '/DOP';
        static houdiniType = 'popmetaballforce';
        static title = 'POP Metaball Force';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_popmetaballforce.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP'];
            const outputs = ['DOP', 'DOP', 'DOP', 'DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "activate", label: "Activation", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usegroup", label: "Group", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "partgroup", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l popvop1 partgroup", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usegroup == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "showguide", label: "Show Guide Geometry", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "guidecolor", label: "Guide", num_components: 3, default_value: [0, 0, 1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ showguide == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Parameters", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "metaballsource", label: "Geometry Source", menu_items: ["sop", "first", "second", "third", "fourth"], menu_labels: ["SOP", "First Context Geometry", "Second Context Geometry", "Third Context Geometry", "Fourth Context Geometry"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "metaballpath", label: "SOP Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ metaballsource != sop }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "opfilter": "!!SOP!!", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "forcescale", label: "Force Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "ignoremass", label: "Ignore Mass", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "uselocal", label: "Use VEXpression", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "localexpression", label: " ", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import vexpressionmenu\n\nreturn vexpressionmenu.buildSnippetMenu('popmetaballforce/localexpression')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ uselocal == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "editor": "1", "editorlang": "vex", "editorlines": "8-40", "script_action": "import vexpressionmenu\n\nnode = kwargs['node']\nparmname = 'localexpression'\n\nvexpressionmenu.createSpareParmsFromChCalls(node, parmname)", "script_action_help": "Creates spare parameters for each unique call of ch() ", "script_action_icon": "BUTTONS_create_parm_from_ch"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1_1", label: "Bindings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "bindgeo", label: "Geometry", num_components: 1, default_value: ["Geometry"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vex_cwdpath", label: "Evaluation Node Path", num_components: 1, default_value: ["."], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/POPs/popmetaballforce',_hnt_DOP_popmetaballforce)
    return _hnt_DOP_popmetaballforce
}
        