
export default function (hou) {
    class _hnt_SOP_extrude extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/extrude';
        static category = '/SOP';
        static houdiniType = 'extrude';
        static title = 'Extrude - Old';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_extrude.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "sourceGrp", label: "Source Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "xsectionGrp", label: "X-Section Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 1\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Values", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "doFuse", label: "Fuse Points", menu_items: ["off", "all", "min", "on"], menu_labels: ["No fusion", "Clamp all points", "Clamp minimal set", "Clamp individual face"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "frontType", label: "Front Face", menu_items: ["outNone", "face", "Convex"], menu_labels: ["No Output", "Output Face", "Convex Face"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "backType", label: "Back Face", menu_items: ["outNone", "face", "Convex"], menu_labels: ["No Output", "Output Face", "Convex Face"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "sideType", label: "Side Mesh", menu_items: ["outNone", "rows", "cols", "rowcol", "triangles", "quads", "alttriangles"], menu_labels: ["No Output", "Rows", "Columns", "Rows and Columns", "Triangles", "Quadrilaterals", "Alternating triangles"], default_value: 5, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "polys", label: "Convert Mesh To Polygons", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "initExtrude", label: "Initialize Extrusion"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "thickxlate", label: "Thickness Offset", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "thickscale", label: "Thickness Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "depthxlate", label: "Depth Offset", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "depthscale", label: "Depth Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "vertex", label: "Vertex", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "doCusp", label: "Cusp Polygonal Sides", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "cuspangle", label: "Side Cusp Angle", num_components: 1, default_value: [20], min: 0, max: 40, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "shareFaces", label: "Consolidate Faces to Mesh", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "removeSharedSides", label: "Remove Shared Sides", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "dohole", label: "Hole Polygons", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_1", label: "Groups", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "newg", label: "Create Output Groups", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "frontgrp", label: "Front Group", num_components: 1, default_value: ["extrudeFront"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "backgrp", label: "Back Group", num_components: 1, default_value: ["extrudeBack"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "sidegrp", label: "Side Group", num_components: 1, default_value: ["extrudeSide"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/extrude',_hnt_SOP_extrude)
    return _hnt_SOP_extrude
}
        