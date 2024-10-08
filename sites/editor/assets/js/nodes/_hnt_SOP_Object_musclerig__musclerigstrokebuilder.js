
export default function (hou) {
    class _hnt_SOP_Object_musclerig__musclerigstrokebuilder extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Other/Object/musclerig::musclerigstrokebuilder';
        static category = '/SOP';
        static houdiniType = 'Object/musclerig::musclerigstrokebuilder';
        static title = 'Muscle Rig Stroke Builder';
        static icon = 'None';
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
			let hou_parm_template = new hou.ButtonParmTemplate({name: "export", label: "Accept Stroke"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "acceptandstrokenew", label: "Accept and Create New Stroked Muscle"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeAndCreateNewMuscle(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import muscletoolutils;muscletoolutils.exportStrokeAndCreateNewMuscle(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reset", label: "Clear Stroke"});
			hou_parm_template.setScriptCallback("hou.pwd().parm('stroke_numstrokes').set(0)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().parm('stroke_numstrokes').set(0)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "displayproxy", label: "Display Proxy Muscle", default_value: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "useN", label: "Depth Projection", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["Along View Direction", "Along Surface Normal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback": "import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "depth", label: "Depth", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback": "import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "stroke_radius", label: "Radius", num_components: 1, default_value: [0.04], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback": "import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "strokeprofile", label: "Profile", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( catmull-rom ) 2pos ( 0.47425475716590881 ) 2value ( 1 ) 2interp ( catmull-rom ) 3pos ( 0.99864500761032104 ) 3value ( 0 ) 3interp ( catmull-rom )", "script_callback": "import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "strokeprofilemin", label: "Profilemin", num_components: 1, default_value: [0.15], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "strokeprofilemax", label: "Profilemax", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import muscletoolutils;muscletoolutils.exportStrokeToMuscle(hou.pwd(), exit_stroke_state=False)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1_1", label: "Stroke Parms", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template.hide(true);
			let hou_parm_template2 = new hou.IntParmTemplate({name: "stroke_tool", label: "Tool", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "stroke_color", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "stroke_opacity", label: "Opacity", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "stroke_projtype", label: "Projection", menu_items: ["xy", "yz", "zx", "screen", "geometry"], menu_labels: ["XY Plane", "YZ Plane", "ZX Plane", "Screen Plane", "Geometry"], default_value: 4, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "stroke_projcenter", label: "Projection Center", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "stroke_numstrokes", label: "Number of Strokes", folder_type: hou.folderType.TabbedMultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "multistartoffset": "1"});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "stroke#_enable", label: "Enable Stroke", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "stroke#_radius", label: "Radius", num_components: 1, default_value: [0.1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "stroke#_tool", label: "Tool", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "stroke#_color", label: "Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "stroke#_opacity", label: "Opacity", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "stroke#_projtype", label: "Projection", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "stroke#_projcenter", label: "Projection Center", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "stroke#_projdir", label: "Projection Direction", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "stroke#_data", label: "Raw Data", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "stroke#_metadata", label: "Meta Data", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "prestroke", label: "Prestroke"});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.muscleStrokeBuilderPrestroke(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import muscletoolutils;muscletoolutils.muscleStrokeBuilderPrestroke(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "poststroke", label: "Poststroke"});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.muscleStrokeBuilderPoststroke(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import muscletoolutils;muscletoolutils.muscleStrokeBuilderPoststroke(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "state_eventcallback", label: "State Event Callback"});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallback("import muscletoolutils;muscletoolutils.muscleStrokeBuilderStateEventCallback(hou.pwd(), kwargs)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "import muscletoolutils;muscletoolutils.muscleStrokeBuilderStateEventCallback(hou.pwd(), kwargs)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "stroke_prompt", label: "Prompt", num_components: 1, default_value: ["Left-drag to draw. Scroll mouse wheel or Shift-left-drag to resize muscle radius. Enter to accept."], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Folder Name", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template.hide(true);
			hou_parm_template2 = new hou.RampParmTemplate({name: "colorramp", label: "Color", ramp_parm_type: hou.rampParmType.Color, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/Object/musclerig::musclerigstrokebuilder',_hnt_SOP_Object_musclerig__musclerigstrokebuilder)
    return _hnt_SOP_Object_musclerig__musclerigstrokebuilder
}
        