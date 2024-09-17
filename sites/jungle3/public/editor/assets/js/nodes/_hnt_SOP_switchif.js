
export default function (hou) {
    class _hnt_SOP_switchif extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/switchif';
        static category = '/SOP';
        static houdiniType = 'switchif';
        static title = 'Switch-If';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_switchif.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "mergecondition", label: "Use Second Input If", menu_items: ["all", "any", "none", "missing"], menu_labels: ["All Conditions True", "Any Condition True", "All Conditions False", "Any Condition False"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "testinput", label: "Test Input", menu_items: ["first", "second", "spare"], menu_labels: ["First Input", "Second Input", "Spare Input 0"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallback("if kwargs['script_value'] == 'spare' and kwargs['node'].parm('spare_input0') is None:\n    kwargs['node'].addSpareParmTuple(hou.StringParmTemplate('spare_input0', 'Spare Input 0', 1, '', help='Refer to this in expressions as -1, such as: npoints(-1)', tags={ 'opfilter' : '!!SOP!!' }, string_type=hou.stringParmType.NodeReference))");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "if kwargs['script_value'] == 'spare' and kwargs['node'].parm('spare_input0') is None:\n    kwargs['node'].addSpareParmTuple(hou.StringParmTemplate('spare_input0', 'Spare Input 0', 1, '', help='Refer to this in expressions as -1, such as: npoints(-1)', tags={ 'opfilter' : '!!SOP!!' }, string_type=hou.stringParmType.NodeReference))", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "tests", label: "Number of Tests", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "enable#", label: "enable#", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "type#", label: "Test Type", menu_items: ["expr", "attrib", "count", "attribval", "hasinput"], menu_labels: ["Expression", "Attribute Presence", "Element Count", "Attribute Value", "Input Wired"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "expr#", label: "Enable", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != expr }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "attribtype#", label: "Enable When", menu_items: ["all", "any", "none", "missing"], menu_labels: ["All Attributes Present", "Any Attribute Present", "All Attributes Absent", "Any Attribute Absent"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attrib }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "attribowner#", label: "Class", menu_items: ["any", "detail", "prim", "point", "vertex", "pointvertex"], menu_labels: ["Any", "Detail (Global)", "Primitive", "Point", "Vertex", "Point or Vertex"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attrib type# != attribval }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "attributes#", label: "Attributes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attrib type# != attribval }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "attribvaltype#", label: "Of Type", menu_items: ["flt", "str"], menu_labels: ["Number", "String"], default_value: 0, default_expression: "float", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attribval }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "attribfloatcomp#", label: "Is", menu_items: ["equal", "nequal", "greater", "less", "gequal", "lequal"], menu_labels: ["Equal to", "Not Equal to", "Greater than", "Less than", "Greater than or Equal to", "Less than or Equal to"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attribval } { attribvaltype# != flt }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "attribstringcomp#", label: "Is", menu_items: ["equal", "nequal", "match", "nomatch", "contains"], menu_labels: ["Equal to", "Not Equal to", "Matching", "Not Matching", "Containing Any Element Matching"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attribval } { attribvaltype# != str }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "attribval#", label: "Value", num_components: 1, default_value: [0], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attribval } { attribvaltype# != flt }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "attribsval#", label: "Value", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != attribval } { attribvaltype# != str }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "counttype#", label: "Enable When", menu_items: ["points", "prims", "vertices"], menu_labels: ["Number of Points", "Number of Primitives", "Number of Vertices"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != count }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "countgroup#", label: "In Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != count }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "countcomp#", label: "Is", menu_items: ["equal", "nequal", "greater", "less", "gequal", "lequal"], menu_labels: ["Equal to", "Not Equal to", "Greater than", "Less than", "Greater than or Equal to", "Less than or Equal to"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != count }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "countval#", label: "Value", num_components: 1, default_value: [0], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != count }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "hasinputtype#", label: "Enable When", menu_items: ["wired", "notwired"], menu_labels: ["Input is Wired", "Input is Not Wired"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ type# != hasinput }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/switchif',_hnt_SOP_switchif)
    return _hnt_SOP_switchif
}
        