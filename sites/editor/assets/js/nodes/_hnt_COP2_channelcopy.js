
export default function (hou) {
    class _hnt_COP2_channelcopy extends hou._HoudiniBase {
        static is_root = false;
        static id = 'COP2/Other/channelcopy';
        static category = '/COP2';
        static houdiniType = 'channelcopy';
        static title = 'Channel Copy';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_channelcopy.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2', 'COP2', 'COP2', 'COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Channel Copy", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "numcopies", label: "Copy Controls", folder_type: hou.folderType.MultiparmBlock, default_value: 1, ends_tab_group: false});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "copyto#", label: "Target", num_components: 1, default_value: ["(none)"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "newplane#", label: "New Plane", menu_items: ["rgb", "a", "a3", "m", "m3", "z", "l", "b", "p", "n", "v"], menu_labels: ["C    (rgb)", "A", "A    (rgb)", "M", "M    (rgb)", "Pz", "L", "B    (uv)", "P    (xyz)", "N    (xyz)", "V    (xyz)"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "copyfrom#", label: "Source", num_components: 1, default_value: ["0-Set"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "copyop#", label: "", menu_items: ["lum", "ntsclum", "average", "max", "min", "magnitude", "hue", "saturation", "red", "green", "blue", "comp4"], menu_labels: ["Luminance", "NTSC Luminance", "Average", "Maximum Component", "Minimum Component", "Magnitude", "Hue", "Saturation", "Red", "Green", "Blue", "Component 4"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "color#", label: "", num_components: 4, default_value: [1, 1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher_1", label: "Mask", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "effectamount", label: "Effect Amount", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "maskinput", label: "Operation Mask", menu_items: ["first", "mask", "off"], menu_labels: ["First Input", "Mask Input", "Off"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "maskplane", label: "", num_components: 1, default_value: ["A"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.hideLabel(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "maskresize", label: "Resize Mask to Fit Image", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "maskinvert", label: "Invert Mask", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Other/channelcopy',_hnt_COP2_channelcopy)
    return _hnt_COP2_channelcopy
}
        