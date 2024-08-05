
export default function (hou) {
    class _hnt_SOP_grouppromote extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/grouppromote';
        static category = '/SOP';
        static houdiniType = 'grouppromote';
        static title = 'Group Promote';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_grouppromote.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "promotions", label: "Number of Promotions", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "enable#", label: "Enable", default_value: true});
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "fromtype#", label: "Convert From", menu_items: ["auto", "prims", "points", "edges", "vertices"], menu_labels: ["Auto", "Primitives", "Points", "Edges", "Vertices"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "totype#", label: "To", menu_items: ["prims", "points", "edges", "vertices"], menu_labels: ["Primitives", "Points", "Edges", "Vertices"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "group#", label: "Group Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "newname#", label: "New Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "preserve#", label: "Keep Original Group", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "onlyboundary#", label: "Include Only Elements on the Boundary", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "includeunshared#", label: "Include Unshared Edges", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { onlyboundary# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "includecurveunshared#", label: "Include All Unshared Curve Edges", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { onlyboundary# == 0 } { includeunshared# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useconnectivityattrib#", label: "useconnectivityattrib#", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { onlyboundary# == 0 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "connectivityattrib#", label: "Connectivity Attribute", num_components: 1, default_value: ["uv"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { onlyboundary# == 0 } { useconnectivityattrib# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "primsbyattribbndpts#", label: "Include All Primitives Sharing Attribute Boundary Points", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { onlyboundary# == 0 } { totype# != prims }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "onlyfull#", label: "Include Only Elements Entirely Contained in Original Group", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { totype# == points } { onlyboundary# == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "onlyprimsedge#", label: "Include Only Primitives Sharing an Edge with Original Group", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { totype# != prims } { fromtype# == prims } { onlyboundary# == 1 } { onlyfull# == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "removedegen#", label: "Remove Degenerate Bridges", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { totype# == prims }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "toattrib#", label: "Output as Integer Attribute", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 } { totype# == edges }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/grouppromote',_hnt_SOP_grouppromote)
    return _hnt_SOP_grouppromote
}
        