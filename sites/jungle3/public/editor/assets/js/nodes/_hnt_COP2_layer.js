
export default function (hou) {
    class _hnt_COP2_layer extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'COP2/Other/layer';
        static category = '/COP2';
        static houdiniType = 'layer';
        static title = 'Layer';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_layer.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Layer", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "op", label: "Global Operation", menu_items: ["over", "under", "atop", "inside", "outside", "screen", "add", "sub", "diff", "mult", "min", "max", "avg", "xor"], menu_labels: ["Over", "Under", "Atop", "Inside", "Outside", "Screen", "Add", "Subtract", "Diff", "Multiply", "Minimum", "Maximum", "Average", "Exclusive Or"], default_value: 0, icon_names: ["COP2_over", "COP2_under", "COP2_atop", "COP2_inside", "COP2_outside", "COP2_screen", "COP2_add", "COP2_subtract", "COP2_diff", "COP2_multiply", "COP2_min", "COP2_max", "COP2_average", "COP2_xor"], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "alphaop", label: "Alpha Operation", menu_items: ["global", "over", "under", "atop", "inside", "outside", "screen", "add", "sub", "diff", "mult", "min", "max", "avg", "xor"], menu_labels: ["(Same as Above)", "Over", "Under", "Atop", "Inside", "Outside", "Screen", "Add", "Subtract", "Diff", "Multiply", "Minimum", "Maximum", "Average", "Exclusive Or"], default_value: 0, icon_names: ["COP2_over", "COP2_under", "COP2_atop", "COP2_inside", "COP2_outside", "COP2_screen", "COP2_add", "COP2_subtract", "COP2_diff", "COP2_multiply", "COP2_min", "COP2_max", "COP2_average", "COP2_xor"], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "units", label: "Image Units", menu_items: ["uv", "pixel"], menu_labels: ["UV Coords", "Pixels"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "filter", label: "Image Filter", num_components: 1, default_value: ["box"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "bgweight", label: "Background Weight", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "scopergba", label: "Plane Scope", num_components: 1, default_value: [15], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.CRGBAPlaneChooser, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "pscope", label: "", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useblur", label: "Enable Motion Blur", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "mblur", label: "Motion Blur", num_components: 1, default_value: [1], min: 0, max: 2, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "mbias", label: "Motion Frame Bias", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "mseg", label: "Motion Blur Segments", num_components: 1, default_value: [10], min: 1, max: 16, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "mtype", label: "Motion Blur Method", menu_items: ["velocity", "deformation"], menu_labels: ["Velocity", "Deformation"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_1", label: "Transform", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.LabelParmTemplate({name: "label", label: "Bottom FG Layer", column_labels: ["", "Top FG Layer"]});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "layers", label: "Layers", folder_type: hou.folderType.TabbedMultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2.hide(true);
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "layer#enable", label: "Enable Layer #", default_value: true});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "layer#op", label: "Operation", menu_items: ["global", "over", "under", "atop", "inside", "outside", "screen", "add", "sub", "diff", "mult", "min", "max", "avg", "xor"], menu_labels: ["(Global Op)", "Over", "Under", "Atop", "Inside", "Outside", "Screen", "Add", "Subtract", "Diff", "Multiply", "Minimum", "Maximum", "Average", "Exclusive Or"], default_value: 0, icon_names: ["COP2_over", "COP2_under", "COP2_atop", "COP2_inside", "COP2_outside", "COP2_screen", "COP2_add", "COP2_subtract", "COP2_diff", "COP2_multiply", "COP2_min", "COP2_max", "COP2_average", "COP2_xor"], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "layer#alphaop", label: "Alpha Operation", menu_items: ["uselayer", "over", "under", "atop", "inside", "outside", "screen", "add", "sub", "diff", "mult", "min", "max", "avg", "xor"], menu_labels: ["(Same as Above)", "Over", "Under", "Atop", "Inside", "Outside", "Screen", "Add", "Subtract", "Diff", "Multiply", "Minimum", "Maximum", "Average", "Exclusive Or"], default_value: 0, icon_names: ["COP2_over", "COP2_under", "COP2_atop", "COP2_inside", "COP2_outside", "COP2_screen", "COP2_add", "COP2_subtract", "COP2_diff", "COP2_multiply", "COP2_min", "COP2_max", "COP2_average", "COP2_xor"], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "layer#wrap", label: "Image Wrap", menu_items: ["repeat", "clamp", "decal", "mirror"], menu_labels: ["Repeat", "Clamp", "Decal", "Mirror"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "layer#t", label: "Translate", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "layer#r", label: "Rotate", num_components: 1, default_value: [0], min: null, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "layer#s", label: "Scale", num_components: 2, default_value: [1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "layer#p", label: "Pivot", num_components: 2, default_value: [0.5, 0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "layer#weight", label: "Weight", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "layer#planes", label: "Layer Planes", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_2", label: "Merge", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.MenuParmTemplate({name: "planemerge", label: "Plane Merge", menu_items: ["keepall", "common", "first"], menu_labels: ["Merge All Planes", "Only Keep Common Planes", "Only Keep First Input's Planes"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "depthmatch", label: "Raster Depth", menu_items: ["promote", "demote", "usefirst", "error"], menu_labels: ["Promote to Highest Bit Depth", "Demote to Lowest Bit Depth", "Use the First Input's Bit Depth", "Error if Bit Depths Differ"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "rangematch", label: "Frame Range", menu_items: ["firsttrim", "firstshift", "extend", "common"], menu_labels: ["Trim To The First Input's Range", "Shift To The First Input's Range", "Extend Sequence To Maximum Range", "Trim To Smallest Range"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "ratematch", label: "Frame Rate", menu_items: ["first", "max", "next", "error"], menu_labels: ["Use The First Input's Frame Rate", "Use The Highest Frame Rate", "Use The Lowest Frame Rate", "Error If The Frame Rates Differ"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "framematch", label: "Frame Match", menu_items: ["nearest", "previous", "next"], menu_labels: ["Use Nearest Frame", "Use The Closest Previous Frame", "Use The Closest Next Frame"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Other/layer',_hnt_COP2_layer)
    return _hnt_COP2_layer
}
        