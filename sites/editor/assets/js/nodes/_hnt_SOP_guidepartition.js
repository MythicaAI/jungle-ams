
export default function (hou) {
    class _hnt_SOP_guidepartition extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Hair and Fur/guidepartition';
        static category = '/SOP';
        static houdiniType = 'guidepartition';
        static title = 'Guide Partition';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_guidepartition.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP'];
            const outputs = ['SOP', 'SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "drawpartingline", label: "Draw Parting Line"});
			hou_parm_template.setScriptCallback("__import__(\"furtoolutils\").drawPartingLine(kwargs, skininput=1, curveinput=3)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"button_icon": "", "script_callback": "__import__(\"furtoolutils\").drawPartingLine(kwargs, skininput=1, curveinput=3)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "partingpropertiesfolder", label: "Parting Properties", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "partingradius", label: "Radius", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "partingradiusoverride", label: "Radius Override", menu_items: ["none", "skinattrib", "texture"], menu_labels: ["No Override", "Skin Attribute", "Texture"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"parmoverride_mainparm": "partingradius"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "partingradiusattrib", label: "Radius Attrib", num_components: 1, default_value: ["partingradius"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import furtoolutils\n\ntry:\n    return furtoolutils.buildSkinPaintAttribMenu(\n            kwargs['node'], skininput=1, skinparmname=None,\n            attribSize=1)\nexcept:\n    return []", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ partingradiusoverride != skinattrib }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "partingradius", "script_action": "import furtoolutils\n\nfurtoolutils.paintSkinAttrib(\n    kwargs,\n    kwargs['parmtuple'][0].eval(),\n    1.0, 1,\n    skinparmname=None)", "script_action_help": "Paint Radius Attrib", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "partingradiustexture", label: "Radius Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ partingradiusoverride != texture }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "partingradius"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "partingstrength", label: "Strength", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "partingstrengthoverride", label: "Strength Override", menu_items: ["none", "skinattrib", "texture"], menu_labels: ["No Override", "Skin Attribute", "Texture"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"parmoverride_mainparm": "partingstrength"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "partingstrengthattrib", label: "Strength Attrib", num_components: 1, default_value: ["partingstrength"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import furtoolutils\n\ntry:\n    return furtoolutils.buildSkinPaintAttribMenu(\n            kwargs['node'], skininput=1, skinparmname=None,\n            attribSize=1)\nexcept:\n    return []", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ partingstrengthoverride != skinattrib }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "partingstrength", "script_action": "import furtoolutils\n\nfurtoolutils.paintSkinAttrib(\n    kwargs,\n    kwargs['parmtuple'][0].eval(),\n    1.0, 1,\n    skinparmname=None)", "script_action_help": "Paint Strength Attrib", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "partingstrengthtexture", label: "Strength Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ partingstrengthoverride != texture }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "partingstrength"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "resamplefolder", label: "Resample", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "resample", label: "Resample", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "resampleseglength", label: "Segment Length", num_components: 1, default_value: [0.05], min: 0.01, max: 0.1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ resample == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Hair and Fur/guidepartition',_hnt_SOP_guidepartition)
    return _hnt_SOP_guidepartition
}
        