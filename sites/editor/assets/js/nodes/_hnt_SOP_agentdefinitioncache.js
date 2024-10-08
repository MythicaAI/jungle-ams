
export default function (hou) {
    class _hnt_SOP_agentdefinitioncache extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Crowds/agentdefinitioncache';
        static category = '/SOP';
        static houdiniType = 'agentdefinitioncache';
        static title = 'Agent Definition Cache';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_agentdefinitioncache.svg';
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
			let hou_parm_template = new hou.ToggleParmTemplate({name: "loadfromdisk", label: "Load from Disk", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "keepexternalref", label: "Keep External References", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ loadfromdisk == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload"});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ loadfromdisk == 0 }");
			hou_parm_template.setScriptCallback("hou.phm().reloadFiles(kwargs['node'])");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback": "hou.phm().reloadFiles(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "agentname", label: "Agent Name", num_components: 1, default_value: ["agent1"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "cachedir", label: "Cache Directory", num_components: 1, default_value: ["${HIP}/agents/${AGENT}"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Directory, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "execute", label: "Save to Disk"});
			hou_parm_template.setScriptCallback("rop = kwargs[\"node\"].node(\"rop_network/OUT\").parm(\"execute\").pressButton() ");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback": "rop = kwargs[\"node\"].node(\"rop_network/OUT\").parm(\"execute\").pressButton() ", "script_callback_language": "python", "takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "mkpath", label: "Create Intermediate Directories", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bakerig", label: "Bake Rig", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "rig", label: "Rig", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_rig.rig"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a rop_network/save_agent_definition rig", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bakerig == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bakelayers", label: "Bake Layers", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "layers", label: "Agent Layers", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_layer.${LAYER}.lay"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a rop_network/save_agent_definition layers", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bakelayers == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bakeshapes", label: "Bake Shapes", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "shapelib", label: "Shape Library", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_shapelib.bgeo.sc"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a rop_network/save_agent_definition shapelib", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bakeshapes == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bakeclip", label: "Bake Clip", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "clips", label: "Clips", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_clip.${CLIP}.bclip.sc"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a rop_network/save_agent_definition clips", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bakeclip == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "baketransformgroups", label: "Bake Transform Groups", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "transformgroups", label: "Transform Groups", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_group.${TRANSFORM_GROUP}.grp"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a rop_network/save_agent_definition transformgroups", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ baketransformgroups == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bakemetadata", label: "Bake Metadata", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "metadata", label: "Metadata", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_metadata.json"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a rop_network/save_agent_definition metadata", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bakemetadata == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bakeattributes", label: "Save Attributes", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "attributes", label: "Attributes", num_components: 1, default_value: ["${CACHEDIR}/${AGENT}_attributes.bgeo.sc"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a rop_network/attribs sopoutput", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bakeattributes == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "filechooser_mode": "write"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Crowds/agentdefinitioncache',_hnt_SOP_agentdefinitioncache)
    return _hnt_SOP_agentdefinitioncache
}
        