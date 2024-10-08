
export default function (hou) {
    class _hnt_DOP_scriptsolver extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin, hou._MultiInputMixin) {
        static is_root = false;
        static id = 'DOP/Other/scriptsolver';
        static category = '/DOP';
        static houdiniType = 'scriptsolver';
        static title = 'Script Solver';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_scriptsolver.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP'];
            const outputs = ['DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "parmop_usesnippet", label: "Use Code Snippet", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usesnippet", label: "Use Code Snippet", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_script", label: "Solve Script", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usesnippet == on }");
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "script", label: "Solve Script", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usesnippet == on }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmop_pythonsnippet", label: "Python Snippet", menu_items: ["initial", "always", "never", "default"], menu_labels: ["![BUTTONS_set_initial]Set Initial", "![BUTTONS_set_or_create]Set Always", "![BUTTONS_set_block]Set Never", "![BUTTONS_set_nothing]Use Default"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.ControlNextParameter, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usesnippet == off }");
			hou_parm_template.setTags({"sidefx::look": "icon"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "pythonsnippet", label: "Python Snippet", num_components: 1, default_value: ["def solveForObjects(\n        solver_data, new_dop_objects, existing_dop_objects, time, timestep):\n    \"\"\"Solve for the objects that use this solver.\n\n    solver_data:\n        The hou.DopData for the solver data created by the Python solver DOP\n        node.  A shared instance of this data is attached to each of the\n        objects being solved.  The parameter values from this node will have\n        been copied into fields of the options record on this solver data.\n        The solver_data is read-only while the solver is running.\n    new_dop_objects:\n        hou.DopObjects that have never been solved before by this solver.\n        You may want to create new data on each of these objects.\n    existing_dop_objects:\n        hou.DopObjects that have been solved by this solver in previous\n        timesteps.  You may want to update the data on each of these\n        objects.\n    time:\n        The current simulation time.  This time may be different from the\n        playbar\'s current time.\n    timestep:\n        The amount of simulation time since the solver was last invoked.\n    \"\"\"\n    # Fields on the DOP data will correspond to parameters on the solver node.\n\n    # ******** Put your code here ********\n    print(\'solving new\', new_dop_objects, \'existing\', existing_dop_objects)\n\n    #for dop_object in new_dop_objects:\n    #    initial_position = solver_data.options().field(\'initialposition\')\n    #    sub_data = dop_object.createSubData(\'MySolverData\', \'SIM_EmptyData\')\n    #    sub_data.options().setField(\'position\', initial_position)\n    #\n    #for dop_object in existing_dop_objects:\n    #    sub_data = dop_object.findSubData(\'MySolverData\')\n    #    position = sub_data.options().field(\'position\')\n    #    position += hou.Vector3(1, 2, 3)\n    #    sub_data.options().setField(\'position\', position)\n    #\n    #    with dop_object.editableGeometry() as geo:\n    #        ...do something to modify the geometry...\n\n"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usesnippet == off }");
			hou_parm_template.setTags({"editor": "1", "editorlang": "python", "editorlines": "8-40"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "defaultparmop", label: "Default Operation", menu_items: ["initial", "always", "never"], menu_labels: ["Set Initial", "Set Always", "Set Never"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addaffectors", label: "Make Objects Mutual Affectors", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "dataname", label: "Data Name", num_components: 1, default_value: ["$OS"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "uniquedataname", label: "Unique Data Name", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "solverperobject", label: "Solver Per Object", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/Other/scriptsolver',_hnt_DOP_scriptsolver)
    return _hnt_DOP_scriptsolver
}
        