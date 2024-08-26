
export default function (hou) {
    class _hnt_SOP_kinefx__computerigpose extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/kinefx::computerigpose';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::computerigpose';
        static title = 'Compute Rig Pose';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__computerigpose.svg';
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
			let hou_parm_template = new hou.ButtonParmTemplate({name: "promoteparms", label: "Promote Parameters"});
			hou_parm_template.setScriptCallback("from kinefx import poseparms\nposeparms.promoteComputeRigPoseParms(kwargs['node'], True)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "from kinefx import poseparms\nposeparms.promoteComputeRigPoseParms(kwargs['node'], True)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "path", label: "Operator Path", num_components: 1, default_value: ["."], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "parm", label: "Parameter Name", num_components: 1, default_value: ["transformations"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "restattrib", label: "Rest Pose Attribute", num_components: 1, default_value: ["rest_transform"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "worldspace", label: "World Space", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "multithread", label: "Enable Multithreading", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "preserveshears", label: "Preserve Input Shears", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "outputtrs_folder", label: "Parameter Attributes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputparmattribs", label: "Output Parameters as Attributes", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputparmt", label: "Parameter Translates", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputparmattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputparmr", label: "Parameter Rotates", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputparmattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputparms", label: "Parameter Scales", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputparmattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputparmp", label: "Parameter Pivot Translates", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputparmattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputparmpr", label: "Parameter Pivot Rotates", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputparmattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "outputinternal_folder", label: "Internal Attributes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputinternalattribs", label: "Output Internal Data as Attributes", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputlocaltransform", label: "Local Transform", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputinternalattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputinputlocaltransform", label: "Input Local Transform", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputinternalattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "outputeffectivelocaltransform", label: "Effective Local Transform", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ outputinternalattribs == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "transformations", label: "Transformations", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"multistartoffset": "0", "script_callback": "", "script_callback_language": "python"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "enable#", label: "Enable", default_value: true});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"parm_group_parm": "group#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "group#", label: "Group", num_components: 1, default_value: ["!*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "from kinefx.ui import jointselection\nreturn jointselection.buildTransformMenu(hou.pwd(), inputindex=0, add_prefix=True, is_motionclip=False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"parm_group_parm": "group#", "script_action": "from kinefx.ui import rigtreeutils\nrigtreeutils.selectPointGroupParm(kwargs)\n", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect", "script_callback": "", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "mode#", label: "Mode", menu_items: ["pre", "post", "override", "restpose"], menu_labels: ["Pre-Multiply", "Post-Multiply", "Override", "From Rest Pose"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"parm_group_parm": "group#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "bake#", label: "Bake From Input"});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ mode# != override mode# != restpose }");
			hou_parm_template2.setScriptCallback("hou.phm().bakeKeyframes(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"parm_group_parm": "group#", "script_callback": "hou.phm().bakeKeyframes(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "xOrd#", label: "Transform Order", menu_items: ["srt", "str", "rst", "rts", "tsr", "trs"], menu_labels: ["Scale Rot Trans", "Scale Trans Rot", "Rot Scale Trans", "Rot Trans Scale", "Trans Scale Rot", "Trans Rot Scale"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "rOrd#", label: "Rotate Order", menu_items: ["xyz", "xzy", "yxz", "yzx", "zxy", "zyx"], menu_labels: ["Rx Ry Rz", "Rx Rz Ry", "Ry Rx Rz", "Ry Rz Rx", "Rz Rx Ry", "Rz Ry Rx"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "t#", label: "Translate", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setTags({"autoscope": "1", "autoselect": "1", "parm_group_parm": "group#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "r#", label: "Rotate", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setTags({"autoscope": "1", "autoselect": "1", "parm_group_parm": "group#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "s#", label: "Scale", num_components: 3, default_value: [1, 1, 1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setTags({"autoscope": "1", "autoselect": "1", "parm_group_parm": "group#"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "pivot#", label: "Pivot", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template2.setTags({"group_type": "collapsible"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "p#", label: "Pivot Translate", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template3.setTags({"parm_group_parm": "group#"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "pivot_r#", label: "Pivot Rotate", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enable# == 0 }");
			hou_parm_template3.setTags({"parm_group_parm": "group#"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/kinefx::computerigpose',_hnt_SOP_kinefx__computerigpose)
    return _hnt_SOP_kinefx__computerigpose
}
        