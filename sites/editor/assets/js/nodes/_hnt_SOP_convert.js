
export default function (hou) {
    class _hnt_SOP_convert extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/convert';
        static category = '/SOP';
        static houdiniType = 'convert';
        static title = 'Convert';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_convert.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "fromtype", label: "From Type", menu_items: ["all", "sphere", "tube", "part", "metaball", "poly", "mesh", "bezCurve", "bezSurf", "nurbCurve", "nurbSurf", "pasteSurf", "circle", "tristrip", "trifan", "tribez", "volume", "polySoup", "vdb"], menu_labels: ["All Types", "Sphere", "Tube", "Particles", "Meta-ball", "Polygon", "Mesh", "Bezier Curve", "Bezier Surface", "NURBS Curve", "NURBS Surface", "Pasted Surface", "Circle", "Triangle Strip", "Triangle Fan", "Triangular Bezier", "Volume", "Polygon Soup", "VDB"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "totype", label: "Convert To", menu_items: ["poly", "mesh", "bezCurve", "bezSurf", "nurbCurve", "nurbSurf", "pasteSurf", "circle", "trimBezSurf", "trimNurbSurf", "tribez", "polySoup", "volume", "vdb"], menu_labels: ["Polygon", "Mesh", "Bezier Curve", "Bezier Surface", "NURBS Curve", "NURBS Surface", "Pasted Surface", "Circle", "Trimmed Bezier Surface", "Trimmed NURBS Surface", "Triangular Bezier", "Polygon Soup", "Volume", "VDB"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "surftype", label: "Connectivity", menu_items: ["rows", "cols", "rowcol", "triangles", "quads", "alttriangles", "revtriangles"], menu_labels: ["Rows", "Columns", "Rows and Columns", "Triangles", "Quadrilaterals", "Alternating Triangles", "Reverse Triangles"], default_value: 4, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ totype != bezSurf totype != nurbSurf totype != mesh totype != poly totype != polySoup }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Level of Detail", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "lodu", label: "U", num_components: 1, default_value: [0.5], min: 0.001, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ interphull == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "lodv", label: "V", num_components: 1, default_value: [0.5], min: 0.001, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ interphull == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "lodtrim", label: "Trim-Curve", num_components: 1, default_value: [1], min: 0.001, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ interphull == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_1", label: "Divisions per Span", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.IntParmTemplate({name: "divu", label: "U", num_components: 1, default_value: [2], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ interphull == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "divv", label: "V", num_components: 1, default_value: [2], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ interphull == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "divtrim", label: "Trim-Curve", num_components: 1, default_value: [1], min: 1, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ interphull == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "orderu", label: "U Order", num_components: 1, default_value: [4], min: 2, max: 11, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ totype != bezCurve totype != nurbCurve totype != bezSurf totype != nurbSurf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "orderv", label: "V Order", num_components: 1, default_value: [4], min: 2, max: 11, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ totype != bezSurf totype != nurbSurf }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "pastecoord", label: "Paste Coordinates", menu_items: ["cfeature", "cbase"], menu_labels: ["From Feature Surfaces", "From Base Surface"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "pasteattrib", label: "Paste Attributes", menu_items: ["afeature", "abase"], menu_labels: ["From Feature Surfaces", "From Base Surface"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "new", label: "Preserve Original", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "interphull", label: "Interpolate Through Hulls", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "offset", label: "Volume Offset", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/convert',_hnt_SOP_convert)
    return _hnt_SOP_convert
}
        