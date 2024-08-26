
export default function (hou) {
    class _hnt_SOP_labs__straighten extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Photogrammetry & Scan/labs::straighten';
        static category = '/SOP/labs';
        static houdiniType = 'labs::straighten';
        static title = 'Labs Straighten';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__straighten.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "grouptype", label: "Group Type", menu_items: ["primitive", "point", "edge"], menu_labels: ["Primitives", "Points", "Edges"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "up_group", label: "Up Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = hou.pwd()\ngeo = node.geometry()\n\ngroup_type = node.parm(\"grouptype\").eval()\n\n# primitives\nif group_type == 0:\n    poly_groups = geo.primGroups()\n\n# points \nif group_type == 1:\n    poly_groups = geo.pointGroups()\n\n# edges \nif group_type == 2:\n    poly_groups = geo.edgeGroups()\n\ngroups = []\nfor group in poly_groups:\n    groups.append(group.name()) \n    groups.append(group.name())\n    \nreturn groups", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('grouptype')\nkwargs['inputindex'] = 0\nkwargs['ordered'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invert_up", label: "Invert Up Axis", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "align_forward", label: "Align Forward", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "forward_group", label: "Forward Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = hou.pwd()\ngeo = node.geometry()\n\ngroup_type = node.parm(\"grouptype\").eval()\n\n# primitives\nif group_type == 0:\n    poly_groups = geo.primGroups()\n\n# points \nif group_type == 1:\n    poly_groups = geo.pointGroups()\n\n# edges \nif group_type == 2:\n    poly_groups = geo.edgeGroups()\n\ngroups = []\nfor group in poly_groups:\n    groups.append(group.name()) \n    groups.append(group.name())\n    \nreturn groups", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ align_forward == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('grouptype')\nkwargs['inputindex'] = 0\nkwargs['ordered'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addattrib", label: "Output Attribute", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "outputattrib", label: "Output Attribute", num_components: 1, default_value: ["xform"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ addattrib == 0 }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Photogrammetry & Scan/labs::straighten',_hnt_SOP_labs__straighten)
    return _hnt_SOP_labs__straighten
}
        