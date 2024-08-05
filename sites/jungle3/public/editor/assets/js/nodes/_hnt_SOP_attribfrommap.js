
export default function (hou) {
    class _hnt_SOP_attribfrommap extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Attribute/attribfrommap';
        static category = '/SOP';
        static houdiniType = 'attribfrommap';
        static title = 'Attribute from Map';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_attribfrommap.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Point Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a vopsop1 vex_group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = hou.geometryType.Points\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "use_file", label: "Map Source", menu_items: ["off", "on", "vol"], menu_labels: ["Color Attribute", "File", "Volume"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "filename", label: "Texture Map", num_components: 1, default_value: ["UVcolor.rat"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "read", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload Texture"});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template.setScriptCallback("texcache -c ; opcook -F IN");
			hou_parm_template.setTags({"script_callback": "texcache -c ; opcook -F IN"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "udim", label: "UDIM Filename Expansion", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "texture_channel", label: "Texture Channel", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["C", "P", "Pz", "N"], menu_labels: ["Color", "Position", "Z Depth", "Normal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ use_file == vol }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "volume_name", label: "Volume Name", num_components: 1, default_value: ["mask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs['node']\ntry:\n    geo = node.node('VOLUMES').geometry()\n    names = list(set(geo.primStringAttribValues('name')))\n    out = [None] * len(names) * 2\n    for i, name in enumerate(names):\n        out[2*i] = out[2*i+1] = name\n    return out\nexcept Exception as e:\n    return ['', '']", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_file != vol }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ use_file != vol }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "uvattrib", label: "UV Attribute", num_components: 1, default_value: ["uv"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::attrib_access": "read"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "export_attribute", label: "Export Attribute", num_components: 1, default_value: ["Cd"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "attrib_type", label: "Type", menu_items: ["float", "vector"], menu_labels: ["Float", "Vector"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "color_settings", label: "Color Settings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "srccolorspace", label: "Source Color Space", num_components: 1, default_value: ["auto"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["auto", "linear"], menu_labels: ["Automatic", "Linear"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "color_channel", label: "Color Channel", num_components: 1, default_value: [4], min: 0, max: 4, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["red", "green", "blue", "alpha", "greyscale"], menu_labels: ["Red", "Green", "Blue", "Alpha", "Greyscale"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ attrib_type == vector }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "rgb_color_influence", label: "Color Influence", num_components: 4, default_value: [0.5, 0.6, 0.1, 0], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ color_channel != 4 } { attrib_type == vector }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "visualize_map", label: "Visualize", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ export_attribute == Cd }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "doremap", label: "Do Remap", default_value: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "rgb_scale", label: "Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ doremap == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "rgb_contrast", label: "Contrast", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ doremap == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "rgb_contrast_rolloff", label: "Contrast Rolloff", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ doremap == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "remap_influence", label: "Remap Influence", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ attrib_type == vector } { doremap == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "remap_influence_2_the_basis_strings", "rampbasisdefault": "linear", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampkeys_var": "remap_influence_2_the_key_positions", "rampshowcontrolsdefault": "0", "rampvalues_var": "remap_influence_2_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "color_settings_1", label: "Filter Settings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "filter", label: "Filter", num_components: 1, default_value: ["gauss"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["point", "box", "gauss", "bartlett", "sinc", "hanning", "blackman", "catrom", "mitchell"], menu_labels: ["Point", "Box", "Gaussian", "Bartlett/Triangular", "Sinc Sharpening", "Hanning", "Blackman", "Catmull-Rom", "Mitchell"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "filter_width", label: "Filter Width", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "wrap", label: "Wrap", num_components: 1, default_value: ["streak"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["repeat", "streak", "decal"], menu_labels: ["Repeat", "Streak", "Decal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "border", label: "Border Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file != on } { wrap != decal }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "sop"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "vertexmethod", label: "Vertex UV Promotion", menu_items: ["max", "min", "mean", "mode", "median", "sum", "sumsquare", "rms", "first", "last"], menu_labels: ["Maximum", "Minimum", "Average", "Mode", "Median", "Sum", "Sum of Squares", "Root Mean Square", "First Match", "Last Match"], default_value: 8, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "color_settings_2", label: "Image Settings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "uv_invertu", label: "Invert U", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file == off }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "uv_invertv", label: "Invert V", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file == off }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "uv_scale", label: "Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file == off }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "uv_rz", label: "Rotate", num_components: 1, default_value: [0], min: null, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file == off }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "uv_t", label: "Translate", num_components: 2, default_value: [0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_file == off }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Attribute/attribfrommap',_hnt_SOP_attribfrommap)
    return _hnt_SOP_attribfrommap
}
        