
export default function (hou) {
    class _hnt_COP2_merge extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'COP2/Other/merge';
        static category = '/COP2';
        static houdiniType = 'merge';
        static title = 'Merge';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_merge.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher", label: "Merge", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "planeconflict", label: "Plane Conflict", menu_items: ["rename", "arrayrename", "arrayignore", "ignore", "error"], menu_labels: ["Rename Conflicting Plane", "Add to Plane Array if Identical else Rename", "Add to Plane Array if Identical else Ignore", "Ignore Conflicting Planes", "Error if Conflicts Occur"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "resmatch", label: "Resolution Match", menu_items: ["first", "specify", "highest", "highest", "lowest", "highest", "error"], menu_labels: ["Use First Input's Resolution", "Specify a Resolution", "Use the Highest Resolution", "Use the Highest Resolution, First Input's Aspect", "Use the Lowest Resolution", "Use the Lowest Resolution, First Input's Aspect", "Error if Resolutions Differ"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "size", label: "Size", num_components: 2, default_value: [100, 100], min: 1, max: 100, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "scaletosize", label: "Scale To New Size", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "scalefilter", label: "Scale Filter", menu_items: [], menu_labels: [], default_value: 0, default_expression: "box", default_expression_language: hou.scriptLanguage.Hscript, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "rangematch", label: "Frame Range", menu_items: ["firsttrim", "firstshift", "extend", "common"], menu_labels: ["Trim To The First Input's Range", "Shift To The First Input's Range", "Extend Sequence To Maximum Range", "Trim To Smallest Range"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "ratematch", label: "Frame Rate", menu_items: ["first", "max", "next", "error"], menu_labels: ["Use The First Input's Frame Rate", "Use The Highest Frame Rate", "Use The Lowest Frame Rate", "Error If The Frame Rates Differ"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "framematch", label: "Frame Match", menu_items: ["nearest", "previous", "next"], menu_labels: ["Use Nearest Frame", "Use The Closest Previous Frame", "Use The Closest Next Frame"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "_sep_"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "inputscope", label: "Input Scope", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template2.hide(true);
			let hou_parm_template3 = new hou.StringParmTemplate({name: "input#scope", label: "Input # Scope", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Other/merge',_hnt_COP2_merge)
    return _hnt_COP2_merge
}
        