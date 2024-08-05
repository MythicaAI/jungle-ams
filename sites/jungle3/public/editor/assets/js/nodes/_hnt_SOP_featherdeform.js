
export default function (hou) {
    class _hnt_SOP_featherdeform extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Character FX/Feathers/featherdeform';
        static category = '/SOP';
        static houdiniType = 'featherdeform';
        static title = 'Feather Deform';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_featherdeform.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a closest_point group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('grouptype')\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "deformertype", label: "Deformer Type", menu_items: ["curve", "feather", "surface"], menu_labels: ["Curves", "Feathers", "Surfaces"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "mode", label: "Mode", menu_items: ["capturedeform", "capture", "deform"], menu_labels: ["Capture and Deform", "Capture", "Deform"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder_capture", label: "Capture", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ mode == deform }");
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "pieceattrib", label: "Piece Attribute", num_components: 1, default_value: ["id"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "geo = kwargs['node'].node('INPUT').geometry()\nresult = []\nif geo:\n    for s in [ a.name() for a in geo.pointAttribs() if a.size() == 1 and a.dataType() in ( hou.attribData.Int, hou.attribData.String ) ]:\n        result.append(s)\n        result.append(s)\nreturn result", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder_deform", label: "Deform", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ mode == capture }");
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "treatdeformerassubd", label: "Treat Deformer as Subdivision Surface", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "deformbarbs", label: "Deform Barbs", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "deformbarbsoverride", label: "Deform Barbs Override", menu_items: ["none", "curveattrib", "skinattrib", "texture", "textureprim"], menu_labels: ["No Override", "Guide Attribute", "Skin Attribute", "Texture", "Texture Primitive"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "deformbarbsoptions", label: "Deform Barbs Options", menu_items: ["fit", "ramp"], menu_labels: ["Fit", "Ramp"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle, menu_use_token: false, is_button_strip: true, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "deformbarbsinrange", label: "In Range", num_components: 2, default_value: [0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ deformbarbsoverride == none }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoptions != 1 deformbarbsoptions != 3 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "deformbarbsoutrange", label: "Out Range", num_components: 2, default_value: [0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ deformbarbsoverride == none }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoptions != 1 deformbarbsoptions != 3 }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "deformbarbsremapramp", label: "Deform Barbs Remap Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoptions != 2 deformbarbsoptions != 3 }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "deformbarbscurveattrib", label: "Deform Barbs Attrib", num_components: 1, default_value: ["deformbarbs"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import furtoolutils\n\ntry:\n    return furtoolutils.buildSkinPaintAttribMenu(\n            kwargs['node'], skininput=0, skinparmname=None,\n            attribSize=1)\nexcept:\n    return []", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoverride != curveattrib }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "deformbarbsattrib", label: "Deform Barbs Attrib", num_components: 1, default_value: ["deformbarbs"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import furtoolutils\n\ntry:\n    return furtoolutils.buildSkinPaintAttribMenu(\n            kwargs['node'], skininput=1, skinparmname=None,\n            attribSize=1)\nexcept:\n    return []", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoverride != skinattrib }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs", "script_action": "import furtoolutils\n\nfurtoolutils.paintSkinAttrib(\n    kwargs,\n    kwargs['parmtuple'][0].eval(),\n    1.0, 1,\n    skinparmname=None)", "script_action_help": "Paint Deform Barbs Attrib", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "deformbarbstexture", label: "Deform Barbs Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoverride != texture }");
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "deformbarbstextureprim", label: "Deform Barbs Texture", num_components: 1, default_value: ["deformbarbs"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils\n\nreturn terraintoolutils.buildNameMenu(kwargs['node'], input_num=2)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoverride != textureprim }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs", "script_action": "import furtoolutils\n\nfurtoolutils.paintTextureMask(\n    kwargs,\n    kwargs['parmtuple'][0].eval(),\n    1.0, skininput=1,\n    skinparmname=None,\n    textureinput=2)", "script_action_help": "Paint Deform Barbs Attrib Texture", "script_action_icon": "SOP_paint"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "deformbarbsuvmode", label: "UV Mode", menu_items: ["skinuv", "curveuv", "featheruv"], menu_labels: ["Skin UV", "Curve UV", "Feather UV"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ deformbarbsoverride != textureprim }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"parmoverride_mainparm": "deformbarbs"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "attribs", label: "Attributes to Transform", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a transformbyattrib1 attribs", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "transfervel", label: "Transfer Velocity", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "rigidxform", label: "Rigid Transform", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "delcaptureattribs", label: "Delete Capture Attributes", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "skinuvattrib", label: "Skin UV Attribute", num_components: 1, default_value: ["uv"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "ptmenu = kwargs['node'].generateInputAttribMenu(\n    1,\n    hou.attribType.Point,\n    hou.attribData.Float,\n    min_size=3,\n    array_type=False)\nvtxmenu = kwargs['node'].generateInputAttribMenu(\n    1,\n    hou.attribType.Vertex,\n    hou.attribData.Float,\n    min_size=3,\n    array_type=False)\n\nreturn ptmenu + vtxmenu", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "featheruvattrib", label: "Feather UV Attribute", num_components: 1, default_value: ["uv"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "ptmenu = kwargs['node'].generateInputAttribMenu(\n    1,\n    hou.attribType.Point,\n    hou.attribData.Float,\n    min_size=3,\n    array_type=False)\nvtxmenu = kwargs['node'].generateInputAttribMenu(\n    1,\n    hou.attribType.Vertex,\n    hou.attribData.Float,\n    min_size=3,\n    array_type=False)\n\nreturn ptmenu + vtxmenu", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Character FX/Feathers/featherdeform',_hnt_SOP_featherdeform)
    return _hnt_SOP_featherdeform
}
        