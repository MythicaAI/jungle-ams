
export default function (hou) {
    class _hnt_SOP_labs__volume_texture extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Pipeline/Real-Time Engine/labs::volume_texture';
        static category = '/SOP/labs';
        static houdiniType = 'labs::volume_texture';
        static title = 'Labs VolumeTexture Export';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__volume_texture.svg';
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
			let hou_parm_template = new hou.ButtonParmTemplate({name: "render", label: "Render"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "trange", label: "Valid Frame Range", menu_items: ["off", "normal", "on"], menu_labels: ["Render Current Frame", "Render Frame Range", "Render Frame Range Only (Strict)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "f", label: "Start/End/Inc", num_components: 3, default_value: [0, 0, 1], default_expression: ["$RFSTART", "$RFEND", ""], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder2", label: "Sampling", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "up_axis", label: "Up Axis", menu_items: ["0", "1"], menu_labels: ["Y", "Z"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bFrozenFrame", label: "Frame Frozen", default_value: true});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "frame", label: "Frame", num_components: 1, default_value: [0], default_expression: ["$RFSTART"], default_expression_language: [hou.scriptLanguage.Hscript], min: 1, max: 240, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bFrozenFrame == 0 }");
			hou_parm_template2.hide(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Slicing", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.IntParmTemplate({name: "slices", label: "Slices (res^3)", num_components: 1, default_value: [64], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "images_per_line", label: "Images Per Line", num_components: 1, default_value: [8], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.LabelParmTemplate({name: "expectedres", label: "Expected Resolution", column_labels: ["`int(ch('slices')*ch('images_per_line'))` x `int(ch('slices')*ch('slices')/ch('images_per_line'))`"]});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "vm_uvunwrapres", label: "Resolution", num_components: 2, default_value: [512, 512], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "uvresmenu", label: "uvresmenu", menu_items: ["1024 32 32 32", "512 512 64 8", "1000 1000 100 10", "2048 1024 128 16", "2744 2744 196 14", "4096 4096 256 16", "5832 5832 324 18"], menu_labels: ["1024 x 32", "512 x 512", "1000 x 1000", "2048 x 1024", "2744 x 2744", "4096 x 4096", "5832 x 5832"], default_value: 0, default_expression: "256 256", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Mini, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setScriptCallback("opparm . vm_uvunwrapres (`arg(\"$script_value\", 0)` `arg(\"$script_value\", 1)`; opparm . images_per_line `arg(\"$script_value\", 3)`; opparm . slices `arg(\"$script_value\", 2)`");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback": "opparm . vm_uvunwrapres (`arg(\"$script_value\", 0)` `arg(\"$script_value\", 1)`; opparm . images_per_line `arg(\"$script_value\", 3)`; opparm . slices `arg(\"$script_value\", 2)`"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Output", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "preview", label: "Preview", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bInvertValues", label: "Invert Values", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "output_picture", label: "Output Picture", num_components: 1, default_value: ["$HIP/render/${OS}.$F4.exr"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Pipeline/Real-Time Engine/labs::volume_texture',_hnt_SOP_labs__volume_texture)
    return _hnt_SOP_labs__volume_texture
}
        