
export default function (hou) {
    class _hnt_SOP_file extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/file';
        static category = '/SOP';
        static houdiniType = 'file';
        static title = 'File';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_file.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "filemode", label: "File Mode", menu_items: ["auto", "read", "write", "none"], menu_labels: ["Automatic", "Read Files", "Write Files", "No Operation"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(0) == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "file", label: "Geometry File", num_components: 1, default_value: ["default.bgeo"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"filechooser_mode": "read_and_write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload Geometry"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "objpattern", label: "Object Mask", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ file !~ .*[.]sim }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "geodatapath", label: "Geometry Data Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ file !~ .*[.]sim }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "missingframe", label: "Missing Frame", menu_items: ["error", "empty"], menu_labels: ["Report Error", "No Geometry"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ filemode != read hasinput(0) == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "loadtype", label: "Load", menu_items: ["full", "infobbox", "info", "points", "delayed", "packedseq", "packedgeo"], menu_labels: ["All Geometry", "Info Bounding Box", "Info", "Point Cloud", "Packed Disk Primitive", "Packed Disk Sequence", "Packed Geometry"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "packedviewedit", label: "Display Packed As", menu_items: ["unchanged", "full", "points", "box", "centroid", "hidden"], menu_labels: ["Use File Setting", "Full Geometry", "Point Cloud", "Bounding Box", "Centroid", "Hidden"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ loadtype != full } { filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "viewportlod", label: "Display As", menu_items: ["full", "points", "box", "centroid", "hidden"], menu_labels: ["Full Geometry", "Point Cloud", "Bounding Box", "Centroid", "Hidden"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ loadtype != delayed loadtype != packedseq loadtype != packedgeo } { filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "packexpanded", label: "Pack Using Expanded/Absolute File Path", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ loadtype != delayed } { filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "delayload", label: "Delay Load Geometry", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ loadtype != full } { filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "mkpath", label: "Create Intermediate Directories", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ hasinput(0) == 0 } { filemode != auto filemode != write }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "cachesize", label: "Cache Frames", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ filemode != read } { loadtype != full } { packedviewedit != unchanged }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "prefetch", label: "Pre-fetch Geometry", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ filemode != read } { loadtype != full } { packedviewedit != unchanged } { cachesize == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "f", label: "Frame Range", num_components: 2, default_value: [1, 24], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ loadtype != packedseq } { filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "index", label: "Sequence Index", num_components: 1, default_value: [0], default_expression: ["$FF-ch(\"f1\")"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ loadtype != packedseq } { filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "wrap", label: "Wrap Mode", menu_items: ["cycle", "clamp", "strick", "mirror"], menu_labels: ["Cycle", "Clamp", "Strict", "Mirror"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ loadtype != packedseq } { filemode != auto filemode != read }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "retry", label: "Save/Load Retries", num_components: 1, default_value: [0], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/file',_hnt_SOP_file)
    return _hnt_SOP_file
}
        