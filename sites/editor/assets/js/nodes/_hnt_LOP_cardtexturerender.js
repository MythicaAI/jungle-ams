
export default function (hou) {
    class _hnt_LOP_cardtexturerender extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Utility/cardtexturerender';
        static category = '/LOP';
        static houdiniType = 'cardtexturerender';
        static title = 'Card Texture Render';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = [];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "primpattern", label: "Prim", num_components: 1, default_value: ["`lopinputprim('.', 0)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a prune1 primpattern1", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import loputils\nloputils.selectPrimsInParm(kwargs, False)", "script_action_help": "Select primitives in the Scene Viewer or Scene Graph Tree pane.\nCtrl-click to select using the primitive picker dialog.\nShift-click to select using the primitive pattern editor.\nAlt-click to toggle movement of the display flag.", "script_action_icon": "BUTTONS_reselect", "sidefx::usdpathtype": "primlist"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2", label: "Card Axes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "xneg", label: "-X Texture", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "xpos", label: "+X Texture", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "yneg", label: "-Y Texture", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "ypos", label: "+Y Texture", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "zneg", label: "-Z Texture", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "zpos", label: "+Z Texture", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "targettopnetwork", label: "Top Network", num_components: 1, default_value: ["topnet"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("None");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"opfilter": "!!TOP!!", "oprelative": ".", "script_callback": "", "script_callback_language": "python", "spare_category": "TOPCookControls"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder3", label: "Render", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple", "sidefx::header_parm": "_cook_controls_cookoutputnode"});
			hou_parm_template2 = new hou.IntParmTemplate({name: "maxres", label: "Maximum size", num_components: 1, default_value: [256], min: 16, max: 2048, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Logarithmic, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "renderer", label: "Render Delegate", num_components: 1, default_value: ["BRAY_HdKarma"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a render_cards renderer", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "addlight", label: "Add Dome Light", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template2.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "_cook_controls_cookoutputnode", label: "Render to Disk"});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallback("import nodegraphtopui; nodegraphtopui.cookOutputNode(kwargs['node'].parm('targettopnetwork').evalAsNode())");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "import nodegraphtopui; nodegraphtopui.cookOutputNode(kwargs['node'].parm('targettopnetwork').evalAsNode())", "script_callback_language": "python", "spare_category": "TOPCookControls"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "_cook_controls_cancelcook", label: "Cancel"});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallback("import nodegraphtopui; nodegraphtopui.cancelCook(kwargs['node'].parm('targettopnetwork').evalAsNode())");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "import nodegraphtopui; nodegraphtopui.cancelCook(kwargs['node'].parm('targettopnetwork').evalAsNode())", "script_callback_language": "python", "spare_category": "TOPCookControls"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "_cook_controls_dirtyall", label: "Reset"});
			hou_parm_template2.setScriptCallback("import nodegraphtopui; nodegraphtopui.dirtyAll(kwargs['node'].parm('targettopnetwork').evalAsNode(), False)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "import nodegraphtopui; nodegraphtopui.dirtyAll(kwargs['node'].parm('targettopnetwork').evalAsNode(), False)", "script_callback_language": "python", "spare_category": "TOPCookControls"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template2.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "topscheduler", label: "Custom Scheduler", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"oprelative": ".", "spare_category": "Common", "spare_opfilter": "!!TOP!!"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Utility/cardtexturerender',_hnt_LOP_cardtexturerender)
    return _hnt_LOP_cardtexturerender
}
        