
export default function (hou) {
    class _hnt_SOP_rbdgroupconstraints extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/RBD/rbdgroupconstraints';
        static category = '/SOP';
        static houdiniType = 'rbdgroupconstraints';
        static title = 'RBD Group Constraints';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_rbdgroupconstraints.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
            const outputs = ['SOP', 'SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "inputgroup", label: "Input Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a creategroup group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_action": "import soputils\nnode = kwargs['node']\nkwargs['geometrytype'] = hou.geometryType.Primitives\ninputs = node.inputs()\nnuminputs = len(inputs)\nidx = 1 if numinputs >= 2 else 0\nkwargs['inputindex'] = idx\nsoputils.selectGroupParm(kwargs)", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group Name", num_components: 1, default_value: ["connectors"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "usegroups", label: "Groups", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["All to Group", "Group to Group"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group1", label: "Group 1", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs[\"node\"].node(\"blast_non_grouped\").generateInputGroupMenu(0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nnode = kwargs['node']\nkwargs['geometrytype'] = hou.geometryType.Primitives\ninputs = node.inputs()\nnuminputs = len(inputs)\nnprims = len(inputs[2].geometry(node.inputConnections()[2].outputIndex()).iterPrims()) if (numinputs >= 3 and inputs[2]) else 0\nidx = 2 if nprims else 0\nkwargs['inputindex'] = idx\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport. Shift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group2", label: "Group 2", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs[\"node\"].node(\"blast_non_grouped\").generateInputGroupMenu(0)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usegroups < 1 }");
			hou_parm_template.setTags({"script_action": "import soputils\nnode = kwargs['node']\nkwargs['geometrytype'] = hou.geometryType.Primitives\ninputs = node.inputs()\nnuminputs = len(inputs)\nnprims = len(inputs[2].geometry(node.inputConnections()[2].outputIndex()).iterPrims()) if (numinputs >= 3 and inputs[2]) else 0\nidx = 2 if nprims else 0\nkwargs['inputindex'] = idx\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport. Shift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/RBD/rbdgroupconstraints',_hnt_SOP_rbdgroupconstraints)
    return _hnt_SOP_rbdgroupconstraints
}
        