
export default function (hou) {
    class _hnt_SOP_guidedeform extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Hair and Fur/guidedeform';
        static category = '/SOP';
        static houdiniType = 'guidedeform';
        static title = 'Guide Deform';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_guidedeform.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP', 'SOP'];
            const outputs = ['SOP', 'SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "mode", label: "Mode", menu_items: ["skin", "capturedeform", "capture", "deform"], menu_labels: ["Deform only by Skin", "Guide Capture and Deform", "Guide Capture", "Guide Deform"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "method", label: "Method", menu_items: ["pointweights", "existingweights", "barycentricweights"], menu_labels: ["Per Point Capture (Legacy)", "Use Existing Weights", "Barycentric Weights"], default_value: 0, default_expression: "primweights", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Capture", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template.setTabConditional(hou.parmCondType.HideWhen, "{ mode == skin } { mode == deform }");
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "splitclumps", label: "Split Clumps", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method == pointweights }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "singleguide", label: "Pick Single Best Guide", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method == pointweights }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "maxsplitpasses", label: "Maximum Split Passes", num_components: 1, default_value: [10], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != barycentricweights }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "edgeflippasses", label: "Edge Flip Passes", num_components: 1, default_value: [10], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != barycentricweights }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "guidecoverage", label: "Guide Coverage", num_components: 1, default_value: [5], min: 1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useguideradiusattrib", label: "Use Guide Radius Attribute", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "guideradiusattrib", label: "Guide Radius Attribute", num_components: 1, default_value: ["radius"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ useguideradiusattrib == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "computeradius", label: "Compute Radius From Guide Coverage", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ useguideradiusattrib == 1 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "radius", label: "Radius", num_components: 1, default_value: [0.01], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ useguideradiusattrib == 1 } { computeradius == 1 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "limitguidesegs", label: "Limit Segments Per Guide", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "maxguidesegs", label: "Segments Per Guide", num_components: 1, default_value: [3], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ limitguidesegs == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "expandradius", label: "Expand Radius for Uncaptured Points", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "expansioniters", label: "Expansion Iterations", num_components: 1, default_value: [3], min: 0, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ expandradius == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "expansionfactor", label: "Expansion Factor", num_components: 1, default_value: [1.5], min: 0, max: 3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ expandradius == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ method != pointweights }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Deform", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template.setTabConditional(hou.parmCondType.HideWhen, "{ mode == capture }");
			hou_parm_template2 = new hou.MenuParmTemplate({name: "inputtype", label: "Geometry to Deform", menu_items: ["hair", "geo"], menu_labels: ["Hair Curves", "Arbitrary Geometry"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "rigidtransform", label: "Rigidly Transform Pieces", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ inputtype == hair }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usepieceattrib", label: "Use Piece Attribute", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ inputtype == hair } { rigidtransform == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "pieceattrib", label: "Piece Attribute", num_components: 1, default_value: ["class"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ inputtype == hair } { rigidtransform == 0 } { usepieceattrib == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "createorientattrib", label: "Create Orientation Attribute", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "xformattribs", label: "Attributes to Transform", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a xformbyattrib4 attribs", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Hair and Fur/guidedeform',_hnt_SOP_guidedeform)
    return _hnt_SOP_guidedeform
}
        