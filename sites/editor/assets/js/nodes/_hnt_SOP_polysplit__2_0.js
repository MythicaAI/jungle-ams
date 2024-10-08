
export default function (hou) {
    class _hnt_SOP_polysplit__2_0 extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/polysplit::2.0';
        static category = '/SOP';
        static houdiniType = 'polysplit::2.0';
        static title = 'PolySplit';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_polysplit__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "splitloc", label: "Split Locations", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "pathtype", label: "Path Type", menu_items: ["shortest", "quadcut"], menu_labels: ["Shortest Distance", "Edge Loop"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ hasinput(1) == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "polysplit", label: "PolySplit", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "close", label: "Close Path", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pathtype != shortest } { hasinput(1) == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "allowfaces", label: "Allow Split Points on Faces", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pathtype != shortest hasinput(1) == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "quadcomplete", label: "Quad Autocompletion", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pathtype != shortest hasinput(1) == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "edgeloop", label: "Edge Loop", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.IntParmTemplate({name: "numloops", label: "Number of Loops", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pathtype != quadcut } { hasinput(1) == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "parallellooptoggle", label: "Match Profile", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pathtype != quadcut } { hasinput(1) == 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "parallelfliptoggle", label: "Switch Profile", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ pathtype != quadcut } { hasinput(1) == 1 } { parallellooptoggle == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "edgepercenttoggle", label: "edgepercenttoggle", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ pathtype == quadcut hasinput(1) == 0 numloops > 0 parallellooptoggle == 0 }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "edgepercent", label: "Edge Percentage", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ edgepercenttoggle == 0 } { pathtype == quadcut hasinput(1) == 0 numloops > 0 parallellooptoggle == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "updatenorms", label: "Update Point Normals", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "grouptoggle", label: "grouptoggle", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "groupname", label: "Edge Group", num_components: 1, default_value: ["splitPathGroup"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ grouptoggle == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "groupappend", label: "Append to Group", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ grouptoggle == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "tolerance", label: "Tolerance", num_components: 1, default_value: [1e-05], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/polysplit::2.0',_hnt_SOP_polysplit__2_0)
    return _hnt_SOP_polysplit__2_0
}
        