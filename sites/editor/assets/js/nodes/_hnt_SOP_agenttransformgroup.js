
export default function (hou) {
    class _hnt_SOP_agenttransformgroup extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Crowds/agenttransformgroup';
        static category = '/SOP';
        static houdiniType = 'agenttransformgroup';
        static title = 'Agent Transform Group';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_agenttransformgroup.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "transformgroups", label: "Transform Groups", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs['node'].generateInputGroupMenu(0, hou.geometryType.Primitives, parm=kwargs['parm'])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = hou.geometryType.Primitives\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "transform_groups", label: "Transform Groups", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template2.setScriptCallback("kwargs['node'].hdaModule().initGroupName(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"multistartoffset": "0", "script_callback": "kwargs['node'].hdaModule().initGroupName(kwargs)", "script_callback_language": "python"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "name_#", label: "Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "root_transforms_#", label: "Root Transforms", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'], exclusive = False)", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "overrideweights_#", label: "Blend into Group", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "blenddepth_#", label: "Depth", num_components: 1, default_value: [3], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ overrideweights_# == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ overrideweights_# == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "weightramp_#", label: "Transform Weights", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ overrideweights_# == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ overrideweights_# == 0 }");
			hou_parm_template3.setTags({"rampshowcontrolsdefault": "0"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "weightsep_#"});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ overrideweights_# == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "transforms_#", label: "Extra Transforms", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'], exclusive = False)", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "channels_#", label: "Channels", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildChannelMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "filterchannelsbytransforms_#", label: "Filter Channels by Transforms", default_value: true});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "showguidegeo_#", label: "Show Guide Geometry", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "transformgroups_1", label: "Guides", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "guidescale", label: "Scale", num_components: 1, default_value: [0.05], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "descriptiveparm", label: "Description", num_components: 1, default_value: ["chs(\"./DESCRIPTION/text\")"], default_expression: ["chs(\"./DESCRIPTION/text\")"], default_expression_language: [hou.scriptLanguage.Hscript], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hide(true);
			hou_parm_template.hideLabel(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Crowds/agenttransformgroup',_hnt_SOP_agenttransformgroup)
    return _hnt_SOP_agenttransformgroup
}
        