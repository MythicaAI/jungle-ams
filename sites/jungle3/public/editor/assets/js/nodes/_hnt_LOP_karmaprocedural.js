
export default function (hou) {
    class _hnt_LOP_karmaprocedural extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Geometry/karmaprocedural';
        static category = '/LOP';
        static houdiniType = 'karmaprocedural';
        static title = 'Karma Procedural';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_karmaprocedural.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "primpath", label: "Primitive Path", num_components: 1, default_value: ["/$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "sidefx::usdpathtype": "prim"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "procedurals", label: "Procedurals", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "group#", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l sopnet/groups group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\n#kwargs[\'node\'] = kwargs[\'node\'].node(\"sopnet/set_attributes\")\n#kwargs[\'geometrytype\'] = kwargs[\'node\'].parmTuple(\'grouptype\')\n#kwargs[\'inputindex\'] = 0\n#soputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "type#", label: "Type", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1", "2"], menu_labels: ["Sphere", "File", "VDB Iso Surface"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useradius#", label: "Radius", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useradiussnippet#", label: "Use VEXpressions", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ useradius# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "radius#", label: "Radius", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ useradius# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 } { useradiussnippet# == 1 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "radiussnippet#", label: "Radius Snippet", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import vexpressionmenu\n\nreturn vexpressionmenu.buildSnippetMenu('Lop/karmaprocedural/radiussnippet')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ useradius# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 } { useradiussnippet# == 0 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"editor": "1", "editorlang": "vex", "editorlines": "5-40", "script_action": "import vexpressionmenu\n\nnode = kwargs['node']\nparmname = kwargs['parmtuple'].name()\n\nvexpressionmenu.createSpareParmsFromChCalls(node, parmname)", "script_action_icon": "BUTTONS_create_parm_from_ch"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usecolor#", label: "Color", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usecolorsnippet#", label: "Use VEXpressions", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usecolor# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "color#", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usecolor# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 } { usecolorsnippet# == 1 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "colorsnippet#", label: "Color Snippet", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import vexpressionmenu\n\nreturn vexpressionmenu.buildSnippetMenu('Lop/karmaprocedural/colorsnippet')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usecolor# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 0 } { usecolorsnippet# == 0 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"editor": "1", "editorlang": "vex", "editorlines": "5-40", "script_action": "import vexpressionmenu\n\nnode = kwargs['node']\nparmname = kwargs['parmtuple'].name()\n\nvexpressionmenu.createSpareParmsFromChCalls(node, parmname)\n", "script_action_icon": "BUTTONS_create_parm_from_ch"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "filename#", label: "File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 1 }");
			hou_parm_template2.setTags({"filechooser_mode": "read"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vdbfile#", label: "VDB File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != 2 }");
			hou_parm_template2.setTags({"filechooser_mode": "read", "filechooser_pattern": "*.vdb"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Geometry/karmaprocedural',_hnt_LOP_karmaprocedural)
    return _hnt_LOP_karmaprocedural
}
        