
export default function (hou) {
    class _hnt_SOP_labs__quickmaterial__2_1 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Rendering/Material/labs::quickmaterial::2.1';
        static category = '/SOP/labs';
        static houdiniType = 'labs::quickmaterial::2.1';
        static title = 'Labs Quick Material';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__quickmaterial__2_1.svg';
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
			let hou_parm_template = new hou.ButtonParmTemplate({name: "switchoriginal", label: "Switch to Original Materials"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("kwargs['node'].hm().Original(kwargs['node'])");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "kwargs['node'].hm().Original(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usemikkt", label: "Use MikkT", default_value: true});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "mMaterialEntries", label: "Materials", folder_type: hou.folderType.TabbedMultiparmBlock, default_value: 1, ends_tab_group: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "", "script_callback_language": "python"});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "materialdefinition_#", label: "Material Type", menu_items: ["principledshader1", "matcap1"], menu_labels: ["Principledshader", "MatCap"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "materialname_#", label: "Material Name", num_components: 1, default_value: ["Material_#"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "groupselection_#", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l group1 basegroup", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"script_action": "import soputils\nsoputils.selectMaterialGroupParm(kwargs)\n", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm#"});
			hou_parm_template2.setTags({"sidefx::layout_height": "medium", "sidefx::look": "blank"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder0_#", label: "Principledshader", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple", "sidefx::look": "blank"});
			hou_parm_template2.setTabConditional(hou.parmCondType.HideWhen, "{ materialdefinition_# != 0 }");
			let hou_parm_template3 = new hou.FolderParmTemplate({name: "basecolorfolder_#", label: "Base Color", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			let hou_parm_template4 = new hou.StringParmTemplate({name: "principledshader_basecolor_texture_#", label: "BaseColor Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "principledshader_basecolor_#", label: "Tint", num_components: 3, default_value: [1, 1, 1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "opacityfolder_#", label: "Opacity", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.StringParmTemplate({name: "principledshader_opaccolor_texture_#", label: "Opacity Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "normalfolder_#", label: "Normal", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.StringParmTemplate({name: "principledshader_baseNormal_texture_#", label: "Normal Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "principledshader_baseNormal_flipY_#", label: "Flip Y", default_value: false});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "principledshader_roundedEdge_enable_#", label: "Rounded Edge", default_value: false});
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "principledshader_roundedEdge_radius_#", label: "Radius", num_components: 1, default_value: [0], min: 0, max: 0.1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ principledshader_roundedEdge_enable_# == 0 }");
			hou_parm_template4.setJoinWithNext(true);
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.IntParmTemplate({name: "principledshader_roundedEdge_mode_#", label: "Mode", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["both", "concave", "convex"], menu_labels: ["Concave and Convex Edges", "Concave Edges", "Convex Edges"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ principledshader_roundedEdge_enable_# == 0 }");
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "roughnessfolder_#", label: "Roughness", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.StringParmTemplate({name: "principledshader_rough_texture_#", label: "Roughness Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "principledshader_rough_#", label: "Roughness", num_components: 1, default_value: [0.652], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "principledshader_ior_#", label: "IOR", num_components: 1, default_value: [1.1], min: 0, max: 3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "folder0_#_4", label: "Occlusion", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.StringParmTemplate({name: "principledshader_occlusion_texture_#", label: "Occlusion Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "ogl_occlusionmap": "1", "parmvop": "1", "shaderparmcontexts": "surface"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "principledshader_occlusion_textureIntensity_#", label: "Tint Intensity", num_components: 1, default_value: [1], min: 0, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template4.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "surface"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "metallicfolder_#", label: "Metallic", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			hou_parm_template4 = new hou.StringParmTemplate({name: "principledshader_metallic_texture_#", label: "Metallic Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "principledshader_metallic_#", label: "Metallic", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder0_#_2", label: "Matcap", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple", "sidefx::look": "blank"});
			hou_parm_template2.setTabConditional(hou.parmCondType.HideWhen, "{ materialdefinition_# != 1 }");
			hou_parm_template3 = new hou.StringParmTemplate({name: "matcapshader_basecolor_texture_#", label: "MatCap Texture", num_components: 1, default_value: ["$HH/pic/MatCap/OilClay.pic"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "matcapshader_use_texture_alpha_#", label: "Use MatCap Alpha", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Rendering/Material/labs::quickmaterial::2.1',_hnt_SOP_labs__quickmaterial__2_1)
    return _hnt_SOP_labs__quickmaterial__2_1
}
        