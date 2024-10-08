
export default function (hou) {
    class _hnt_DOP_popcurveforce extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/POPs/popcurveforce';
        static category = '/DOP';
        static houdiniType = 'popcurveforce';
        static title = 'POP Curve Force';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_popcurveforce.svg';
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
			hou_parm_template = new hou.ToggleParmTemplate({name: "usegroup", label: "Label", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "partgroup", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import doppoptoolutils\n\nreturn doppoptoolutils.buildGroupMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usegroup == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "Curve_Force", label: "Curve Force", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "usecontextgeo", label: "Geometry Source", menu_items: ["soppath", "doppath", "first", "second", "third", "fourth"], menu_labels: ["SOP", "DOP Object", "Use First Context Geometry", "Use Second Context Geometry", "Use Third Context Geometry", "Use Fourth Context Geometry"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "soppath", label: "SOP Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usecontextgeo != soppath }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ usecontextgeo != soppath }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "opfilter": "!!SOP!!", "oprelative": "."});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "dopobjects", label: "DOP Object", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ usecontextgeo != doppath }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ usecontextgeo != doppath }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "ignoremass", label: "Ignore Mass", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "treataswind", label: "Treat As Wind", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "airresist", label: "Air Resistance", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ treataswind == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "maxradius", label: "Max Influence Radius", num_components: 1, default_value: [2], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex", "units": "m1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "uselocalradius", label: "Use VEXpressions", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "localradius", label: " ", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import vexpressionmenu\n\nreturn vexpressionmenu.buildSnippetMenu('popcurveforce/localradius')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ uselocalradius == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "editor": "1", "editorlang": "vex", "editorlines": "8-40", "script_action": "import vexpressionmenu\n\nnode = kwargs['node']\nparmname = 'localradius'\n\nvexpressionmenu.createSpareParmsFromChCalls(node, parmname)", "script_action_help": "Creates spare parameters for each unique call of ch() ", "script_action_icon": "BUTTONS_create_parm_from_ch"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "IndForces", label: "Individual Forces", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "scalefollow", label: "Follow Scale", num_components: 1, default_value: [1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scalesuction", label: "Suction Scale", num_components: 1, default_value: [1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scaleorbit", label: "Orbit Scale", num_components: 1, default_value: [1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "scaleincomingvel", label: "Inherit Velocity Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "uselocalforce", label: "Use VEXpression", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "localforce", label: " ", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import vexpressionmenu\n\nreturn vexpressionmenu.buildSnippetMenu('popcurveforce/localforce')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ uselocalforce == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "editor": "1", "editorlang": "vex", "editorlines": "8-40", "script_action": "import vexpressionmenu\n\nnode = kwargs['node']\nparmname = 'localforce'\n\nvexpressionmenu.createSpareParmsFromChCalls(node, parmname)", "script_action_help": "Creates spare parameters for each unique call of ch() ", "script_action_icon": "BUTTONS_create_parm_from_ch"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "folder1", label: "Follow Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template4 = new hou.RampParmTemplate({name: "rampfollow", label: "Follow Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "rampfollow_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0.002892960561439395 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 0 ) 2interp ( linear )", "rampkeys_var": "rampfollow_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "rampfollow_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "folder1_1", label: "Suction Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template4 = new hou.RampParmTemplate({name: "rampin", label: "Suction Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "rampin_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampkeys_var": "rampin_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "rampin_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "folder1_2", label: "Orbit Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template4 = new hou.RampParmTemplate({name: "ramporbit", label: "Orbit Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "ramporbit_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 0 ) 2interp ( linear )", "rampkeys_var": "ramporbit_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "ramporbit_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "folder1_3", label: "Velocity Force Falloff", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template4 = new hou.RampParmTemplate({name: "rampvel", label: "Incoming Vel Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "rampvel_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 0 ) 2interp ( linear )", "rampkeys_var": "rampvel_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "rampvel_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "IndForces_1", label: "Global Forces", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.RampParmTemplate({name: "forcefalloff", label: "Global Force Falloff From Curve", ramp_parm_type: hou.rampParmType.Float, default_value: 1, default_basis: null, color_type: null});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "forcefalloff_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 1 ) 1value ( 1 ) 1interp ( linear )", "rampkeys_var": "forcefalloff_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "forcefalloff_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "lengthfalloff", label: "Force Along Length", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "lengthfalloff_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 0.9090038537979126 ) 2value ( 1 ) 2interp ( linear ) 3pos ( 1 ) 3value ( 0 ) 3interp ( linear )", "rampkeys_var": "lengthfalloff_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "lengthfalloff_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "IndForces_2", label: "Shaping", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "resamplecurve", label: "Resample Curve", default_value: true});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "max_seg_length", label: "Max Segment Length", num_components: 1, default_value: [0.1], min: 0.1, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ resamplecurve == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "units": "m1"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm3"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "radiusalonglength", label: "Scale Radius Along Length", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "radiusalonglength_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampkeys_var": "radiusalonglength_the_key_positions", "rampshowcontrolsdefault": "1", "rampvalues_var": "radiusalonglength_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "Curve_Force_1", label: "Guides", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "showguide", label: "Show Guide Geometry", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "guide_color", label: "Guide Color", num_components: 3, default_value: [1, 0, 0], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ showguide == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "guide_spacing", label: "Guide Spacing", num_components: 1, default_value: [1], min: 0.1, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ showguide == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "units": "m1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "showcurve", label: "Show Curve Only", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ showguide == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "Curve_Force_2", label: "Binding", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "bindgeo", label: "Geometry", num_components: 1, default_value: ["Geometry"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/POPs/popcurveforce',_hnt_DOP_popcurveforce)
    return _hnt_DOP_popcurveforce
}
        