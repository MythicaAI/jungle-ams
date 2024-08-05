
export default function (hou) {
    class _hnt_TOP_pythonscheduler extends hou._HoudiniBase {
        static is_root = false;
        static id = 'TOP/Python/pythonscheduler';
        static category = '/TOP';
        static houdiniType = 'pythonscheduler';
        static title = 'Python Scheduler';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_pythonscheduler.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = [];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "savenodescript", label: "Save to Python Script"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("from pdg.hda import savehda;savehda.createSavePythonNodeDialog(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "from pdg.hda import savehda;savehda.createSavePythonNodeDialog(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2", label: "Settings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "pdg_workingdir", label: "Working Directory", num_components: 1, default_value: ["$HIP"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"editor": "0", "editorlang": ""});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pdg_usemaxtasks", label: "Enable Limit Jobs", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "pdg_maxtasks", label: "Limit Jobs", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pdg_usemaxtasks == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "pdg_workitemdatasource", label: "Load Item Data From", menu_items: ["0", "1"], menu_labels: ["Temporary JSON File", "RPC Message"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "pdg_deletetempdir", label: "Delete Temp Dir", menu_items: ["0", "1", "2"], menu_labels: ["Never", "When Scheduler is Deleted", "When Cook Completes"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pdg_compressworkitemdata", label: "Compress Work Item Data", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pdg_workitemdatasource == 1 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pdg_validateoutputs", label: "Validate Outputs When Recooking", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pdg_checkexpectedoutputs", label: "Check Expected Outputs on Disk", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pdg_waitforfailures", label: "Block on Failed Work Items", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2_1", label: "Scheduling", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1", label: "Schedule", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "onschedule", label: "onSchedule Callback", num_components: 1, default_value: ["# Custom onSchedule logic. Returns pdg.ScheduleResult.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# work_item     -  The pdg.WorkItem to schedule\n\nimport subprocess\nimport os\nimport sys\n\n# Ensure directories exist and serialize the work item\nself.createJobDirsAndSerializeWorkItems(work_item)\n\n# expand the special __PDG_* tokens in the work item command\nitem_command = self.expandCommandTokens(work_item.command, work_item)\n\n# add special PDG_* variables to the job's environment\ntemp_dir = str(self.tempDir(False))\n\njob_env = os.environ.copy()\njob_env['PDG_RESULT_SERVER'] = str(self.workItemResultServerAddr())\njob_env['PDG_ITEM_NAME'] = str(work_item.name)\njob_env['PDG_ITEM_ID'] = str(work_item.id)\njob_env['PDG_DIR'] = str(self.workingDir(False))\njob_env['PDG_TEMP'] = temp_dir\njob_env['PDG_SCRIPTDIR'] = str(self.scriptDir(False))\n\n# run the given command in a shell\nreturncode = subprocess.call(item_command, shell=True, env=job_env)\n\n# if the return code is non-zero, report it as failed\nif returncode == 0:\n    return pdg.scheduleResult.CookSucceeded\nreturn pdg.scheduleResult.CookFailed"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1_1", label: "Schedule Static", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "onschedulestatic", label: "onScheduleStatic Callback", num_components: 1, default_value: ["# Custom onScheduleStatic logic.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# dependencies  -  pdg.WorkItem map of dependencies\n# dependents    -  pdg.WorkItem map of dependents\n# ready_items   -  pdg.WorkItem array of work items\n\nreturn"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1_2", label: "Submit As Job", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "submitasjob", label: "submitAsJob Callback", num_components: 1, default_value: ["# Custom submitAsJob logic. Returns the status URI for the submitted job.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# graph_file    -  Path to a .hip file containing the TOP Network, relative to $PDGDIR.\n# node_path     -  Op path to the TOP Network\n\nreturn \"\""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2_2", label: "Initialization and Cleanup", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder6", label: "Start", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "onstart", label: "onStart Callback", num_components: 1, default_value: ["# Custom onStartCook logic. Returns True if started.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# static        -  True if static cook\n# cook_set      -  Set of nodes to cook\n\nreturn True"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder6_1", label: "Stop", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "onstop", label: "onStop Callback", num_components: 1, default_value: ["# Custom onStop logic. Returns True if stopped.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n\nself.stopCallbackServer()\n\nreturn True"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder6_2", label: "Start Cook", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "onstartcook", label: "onStartCook Callback", num_components: 1, default_value: ["# Custom onStartCook logic. Returns True if started.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# static        -  True if static cook\n# cook_set      -  Set of nodes to cook\n\nwd = self[\"pdg_workingdir\"].evaluateString()\nself.setWorkingDir(wd, wd)\n\nif not self.isCallbackServerRunning():\n    self.startCallbackServer()\n\nreturn True"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder6_3", label: "Stop Cook", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "onstopcook", label: "onStopCook Callback", num_components: 1, default_value: ["# Custom onStopCook logic. Returns True if stopped.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# cancel        -  True if cook was cancelled\n\nreturn True\n"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder6_4", label: "onTick", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "ontick", label: "onTick Callback", num_components: 1, default_value: ["# Custom onTick logic. Returns a pdg.tickResult.\n# Called periodically when the graph is cooking.  Can be used to check the state of\n# running work items.  Returns a result to PDG to affect subsequent calls to `onSchedule`.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\nfrom pdg import tickResult\n\nreturn tickResult.SchedulerReady"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2_3", label: "Shared Servers", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder10", label: "End Shared Server", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "endsharedserver", label: "endSharedServer Callback", num_components: 1, default_value: ["# Custom endSharedServer logic. Returns True on success, else False.\n#\n# The following variables are available:\n# self               -  A reference to the current pdg.Scheduler instance\n# sharedserver_name  -  shared server name\n\nreturn True"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder10_1", label: "Transfer File", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "transferfile", label: "transferFile Callback", num_components: 1, default_value: ["# Custom transferFile logic. Returns True on success, else False.\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# file_path     -  Path to file that should be moved\n\nreturn self.transferFile(file_path)"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2_4", label: "Logging", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder13", label: "Log URI", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "getloguri", label: "getLogURI Callback", num_components: 1, default_value: ["# Custom getLogURI logic. Returns the farm\'s log URI for the given task.\n# Should return a valid URI or empty string.\n# E.g.: \'file:///myfarm/tasklogs/jobid20.log\'\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# work_item     -  pdg.WorkItem\n\nreturn \"\""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder13_1", label: "Status URI", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.StringParmTemplate({name: "getstatusuri", label: "getStatusURI Callback", num_components: 1, default_value: ["# Custom getStatusURI logic. Returns the farm\'s status URI for the given task.\n# Should return a valid URI or empty string.\n# E.g.: \'http://myfarm/status/jobid20\'\n#\n# The following variables are available:\n# self          -  A reference to the current pdg.Scheduler instance\n# work_item     -  pdg.WorkItem\n\nreturn \"\""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"editor": "1", "editorlang": "python", "top_multi_expression": ""});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Python/pythonscheduler',_hnt_TOP_pythonscheduler)
    return _hnt_TOP_pythonscheduler
}
        