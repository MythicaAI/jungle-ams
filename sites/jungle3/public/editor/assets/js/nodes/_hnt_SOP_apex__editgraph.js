
export default function (hou) {
    class _hnt_SOP_apex__editgraph extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Animation/APEX/apex::editgraph';
        static category = '/SOP/apex';
        static houdiniType = 'apex::editgraph';
        static title = 'APEX Edit Graph';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_apex__editgraph.svg';
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
			let hou_parm_template = new hou.DataParmTemplate({name: "stash", label: "Geometry Stash", num_components: 1, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reset", label: "Reset"});
			hou_parm_template.setScriptCallback("kwargs[\'node\'].parm(\"stash\").set(hou.Geometry())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "kwargs[\'node\'].parm(\"stash\").set(hou.Geometry())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "errorhandlingmode", label: "Error Handling", menu_items: ["ignore", "warn"], menu_labels: ["Ignore", "Report as Warnings"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "generalscripts", label: "General Scripts", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			let hou_parm_template2 = new hou.ButtonParmTemplate({name: "mergegraph", label: "Merge Graph"});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallback("hou.phm().mergeGraph(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().mergeGraph(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "assubnet", label: "As Subnet", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "importsopnodes", label: "Import SOP Nodes"});
			hou_parm_template2.setScriptCallback("hou.phm().importSopNodes(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().importSopNodes(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "addconverts", label: "Add Missing APEX Convert Nodes"});
			hou_parm_template2.setScriptCallback("hou.phm().addConverts(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().addConverts(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "fixinplace", label: "Add Missing In-Place Input Connections"});
			hou_parm_template2.setScriptCallback("hou.phm().fixMissingInPlaceConnections(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().fixMissingInPlaceConnections(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "updatecallbacknames", label: "Update APEX Node Type Names"});
			hou_parm_template2.setScriptCallback("hou.phm().updateCallbackNames(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().updateCallbackNames(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "riggingscripts", label: "Rigging Scipts", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "importskel", label: "Import KineFX Skeleton"});
			hou_parm_template2.setScriptCallback("hou.phm().mergeFKHierarchy(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().mergeFKHierarchy(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "updaterestsfromskel", label: "Update Rest Transforms From Skeleton"});
			hou_parm_template2.setScriptCallback("hou.phm().updateRestTransformsFromSkel(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().updateRestTransformsFromSkel(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "addsettransforms", label: "Add SetPointTransforms"});
			hou_parm_template2.setScriptCallback("hou.phm().addSetPointTransforms(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.phm().addSetPointTransforms(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Animation/APEX/apex::editgraph',_hnt_SOP_apex__editgraph)
    return _hnt_SOP_apex__editgraph
}
        