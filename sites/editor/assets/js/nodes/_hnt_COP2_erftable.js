
export default function (hou) {
    class _hnt_COP2_erftable extends hou._HoudiniBase {
        static is_root = false;
        static id = 'COP2/Other/erftable';
        static category = '/COP2';
        static houdiniType = 'erftable';
        static title = 'Error Function Table Generator';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_erftable.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Error Function Table Generator", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "max_sdev", label: "Maximum Standard Deviation", num_components: 1, default_value: [10], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_1", label: "Mask", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "effectamount", label: "Effect Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "maskplane", label: "Mask Plane", num_components: 1, default_value: ["A"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "maskresize", label: "Resize Mask to Fit Image", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "maskinvert", label: "Invert Mask", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_2", label: "Image", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "overridesize", label: "Override Global Size", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "size", label: "Override Size", num_components: 2, default_value: [0, 0], default_expression: ["$CXRES", "$CYRES"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 1, max: 1000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "sizemenu", label: "Size Menu", menu_items: [], menu_labels: [], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Mini, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "overrideaspect", label: "Override Pixel Aspect", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "aspect", label: "Pixel Aspect Ratio", num_components: 1, default_value: [0], default_expression: ["$CPIXA"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0.0001, max: 2, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "planes", label: "Image Planes", menu_items: ["rgba", "rgba3", "rgb", "a", "a3", "m", "m3", "z", "l", "b", "p", "n", "v", "terrain_height", "none"], menu_labels: ["C, A (C:rgb A)", "C, A (C:rgb A:rgb)", "C    (rgb)", "A", "A    (rgb)", "M", "M    (rgb)", "Z", "L", "B    (uv)", "P    (xyz)", "N    (xyz)", "V    (xyz)", "Terrain: Height", "None"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "addplanes", label: "Add Plane", menu_items: ["rgba", "rgba3", "rgb", "a", "a3", "m", "m3", "z", "l", "b", "p", "n", "v", "terrain_height", "none"], menu_labels: ["C, A (C:rgb A)", "C, A (C:rgb A:rgb)", "C    (rgb)", "A", "A    (rgb)", "M", "M    (rgb)", "Z", "L", "B    (uv)", "P    (xyz)", "N    (xyz)", "V    (xyz)", "Terrain: Height", "None"], default_value: 5, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "addplaneop", label: "", menu_items: ["replace", "rename", "add", "screen", "subtract", "multiply", "min", "max", "avg"], menu_labels: ["Replace", "Rename", "Add", "Screen", "Subtract", "Multiply", "Min", "Max", "Average"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "customplanes", label: "Custom Planes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "depth", label: "Raster Depth", menu_items: ["int8", "int16", "int32", "float16", "float32", "default"], menu_labels: ["8 Bit Integer", "16 Bit Integer", "32 Bit Integer", "16 Bit Floating Point", "32 Bit Floating Point", "Default Depth"], default_value: 5, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "depthmenu", label: "Depth Menu", menu_items: [], menu_labels: [], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Mini, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "depthglobal", label: "Global Depth Setting", num_components: 1, default_value: [0], default_expression: ["$CDEPTH"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "usebwpoints", label: "Use Custom Black/White Points", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "bwpoints", label: "Black/White Points", num_components: 2, default_value: [0, 0], default_expression: ["$CBP", "$CWP"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "interlace", label: "Interlacing", menu_items: ["none", "inthalf", "intblack", "intdouble"], menu_labels: ["None", "Half Res Interlaced", "Black Interlaced", "Line Doubled"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "idominance", label: "", menu_items: ["odd", "even", "oddonly", "evenonly"], menu_labels: ["Odd First", "Even First", "Odd Only", "Even Only"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_3", label: "Sequence", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "overriderange", label: "Override Global Range", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "singleimage", label: "Still Image", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "start", label: "Start Frame", num_components: 1, default_value: [0], default_expression: ["$FSTART"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 240, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "length", label: "Length", num_components: 1, default_value: [0], default_expression: ["$NFRAMES"], default_expression_language: [hou.scriptLanguage.Hscript], min: 1, max: 240, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "preextend", label: "Pre Extend", menu_items: ["black", "cycle", "mirror", "hold", "holdn"], menu_labels: ["Black Frames", "Cycle", "Mirror", "Hold", "Hold N Frames"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "prehold", label: "Pre Hold", num_components: 1, default_value: [0], min: 0, max: 240, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "postextend", label: "Post Extend", menu_items: ["black", "cycle", "mirror", "hold", "holdn"], menu_labels: ["Black Frames", "Cycle", "Mirror", "Hold", "Hold N Frames"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "posthold", label: "Post Hold", num_components: 1, default_value: [0], min: 0, max: 240, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "vex_edit", label: "Edit VEX Function"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "vex_reload", label: "Re-load VEX Functions"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Other/erftable',_hnt_COP2_erftable)
    return _hnt_COP2_erftable
}
        