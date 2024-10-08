
export default function (hou) {
    class _hnt_SOP_sprite extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Utility/sprite';
        static category = '/SOP';
        static houdiniType = 'sprite';
        static title = 'Sprite';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_sprite.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "bindgroup", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a attribvop1 bindgroup", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('bindgrouptype')\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "spritematerial", label: "Sprite Material", menu_items: ["nochange", "shop", "file"], menu_labels: ["No Change", "SHOP", "Texture File"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dospriteshop", label: "Set Sprite SHOP", default_value: true});
			hou_parm_template.hide(true);
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "spriteshop", label: "Sprite SHOP", num_components: 1, default_value: ["shopnet1/spritefog"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ spritematerial != shop }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "spritemap", label: "Sprite Map", num_components: 1, default_value: ["smokepuff.rat"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ spritematerial == nochange }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "surface"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "drawmode", label: "Draw Sprites for", menu_items: ["nochange", "unconnected", "all"], menu_labels: ["No Change", "Unconnected Points", "All Points"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "spriteblend", label: "Sprite Blending", menu_items: ["nochange", "disable", "enable"], menu_labels: ["No Change", "Disable", "Enable"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "setspritecutoff", label: "Set Sprite Cutoff", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "spritecutoff", label: "Sprite Cutoff", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ setspritecutoff == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dotexturecrop", label: "Texture Crop", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "cropmode", label: "Mode", menu_items: ["offset", "spritesheet"], menu_labels: ["Offset/Size", "Sprite Sheet"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dotexturecrop == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "textureoffset", label: "Texture Offset", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dotexturecrop == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ cropmode != offset }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "texturesize", label: "Texture Size", num_components: 2, default_value: [1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dotexturecrop == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ cropmode != offset }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "textureindex", label: "Sprite Index", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dotexturecrop == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ cropmode != spritesheet }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "texturerowcol", label: "Rows and Columns", num_components: 2, default_value: [1, 1], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dotexturecrop == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ cropmode != spritesheet }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dospriterot", label: "Label", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "spriterot", label: "Rotate", num_components: 1, default_value: [0], min: 0, max: 360, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dospriterot == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dospritescale", label: "Label", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "spritescale", label: "Sprite Scale", num_components: 2, default_value: [1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dospritescale == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usevexpression", label: "Use VEXpression", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "localexpression", label: " ", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import vexpressionmenu\n\nreturn vexpressionmenu.buildSnippetMenu('sprite/localexpression')", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ usevexpression == 0 }");
			hou_parm_template.setTags({"editor": "1", "editorlang": "vex"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Utility/sprite',_hnt_SOP_sprite)
    return _hnt_SOP_sprite
}
        