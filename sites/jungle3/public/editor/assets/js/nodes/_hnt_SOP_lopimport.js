
export default function (hou) {
    class _hnt_SOP_lopimport extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/lopimport';
        static category = '/SOP';
        static houdiniType = 'lopimport';
        static title = 'LOP Import';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_lopimport.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "loppath", label: "LOP Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"opfilter": "!!LOP!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "primpattern", label: "Primitives", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import loputils\nnode = hou.node(kwargs['node'].parm('loppath').eval())\nreturn loputils.createPrimPatternMenu(node, input_idx=None, expressions=('Sop/lopimport', 'Lop/selectionrule'))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import loputils\nkwargs['ctrl'] = True\nloputils.selectPrimsInParm(kwargs, True,\n    lopparmname='loppath', allowinstanceproxies=True)", "script_action_help": "Select primitives using the primitive picker dialog.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "pathattrib", label: "Create Path Attribute", num_components: 1, default_value: ["path"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "nameattrib", label: "Create Name Attribute", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "importtime", label: "Import Frame", num_components: 1, default_value: [0], default_expression: ["$FF"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "importtraversal", label: "Traversal", num_components: 1, default_value: ["none"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["std:components", "std:custom", "std:boundables", "std:groups", "none"], menu_labels: ["Components", "Custom Traversal", "Gprims", "Groups", "No Traversal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "striplayers", label: "Strip Layers Above Layer Breaks", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "parm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "viewportlod", label: "Display As", menu_items: ["full", "points", "box", "centroid", "hidden"], menu_labels: ["Full Geometry", "Point Cloud", "Bounding Box", "Centroid", "Hidden"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "pivot", label: "Pivot Location", menu_items: ["origin", "centroid"], menu_labels: ["Origin", "Centroid"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "purpose", label: "Purpose", num_components: 1, default_value: ["proxy"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["proxy", "render", "guide"], menu_labels: ["proxy", "render", "guide"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/lopimport',_hnt_SOP_lopimport)
    return _hnt_SOP_lopimport
}
        