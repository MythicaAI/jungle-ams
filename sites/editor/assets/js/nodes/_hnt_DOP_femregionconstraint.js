
export default function (hou) {
    class _hnt_DOP_femregionconstraint extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'DOP/FEM/femregionconstraint';
        static category = '/DOP';
        static houdiniType = 'femregionconstraint';
        static title = 'FEM Region Constraint';
        static icon = '/editor/assets/imgs/nodes/_hnt_DOP_femregionconstraint.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DOP'];
            const outputs = ['DOP', 'DOP', 'DOP', 'DOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Constraint", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1", label: "Soft Controls", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "targetstrength", label: "Strength", num_components: 1, default_value: [1000000.0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ type == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "units": "kg1m-3s-2"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "targetdamping", label: "Damping", num_components: 1, default_value: [100000], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ type == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "units": "kg1m-3s-1"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder4", label: "Container", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "constrainedobject", label: "Object", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo \"* *\"\nforeach i ( `dopobjectlist(\".\", \"*\", 1)` )\n  echo $i $i\nend", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "constrainedregistrationattribute", label: "Registration Attribute", num_components: 1, default_value: ["baseP"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "constrainedallowpartialoverlap", label: "Allow Partial Overlap", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "constrainenablemultipliers", label: "Enable Multipliers", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "constrainstrengthattribute", label: "Strength Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ constrainenablemultipliers == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "constraindampingattribute", label: "Damping Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ constrainenablemultipliers == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder4_1", label: "Region", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "goalobject", label: "Object", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo \"* *\"\nforeach i ( `dopobjectlist(\".\", \"*\", 1)` )\n  echo $i $i\nend", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ useanimation == 1 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "goalregistrationattribute", label: "Registration Attribute", num_components: 1, default_value: ["baseP"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "goalallowpartialoverlap", label: "Allow Partial Overlap", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "goalenablemultipliers", label: "Enable Multipliers", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "goalstrengthattribute", label: "Strength Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ goalenablemultipliers == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "goaldampingattribute", label: "Damping Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ goalenablemultipliers == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder2", label: "Matching Attributes", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "enablematching", label: "Enable Matching", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "identifierattribute", label: "Part Identifier Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ enablematching == 0 }");
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_1", label: "Guide Options", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "showguide", label: "Show Guide Geometry", default_value: true});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "guiderad", label: "Radius", num_components: 1, default_value: [0.005], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ showguide == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "units": "m1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "guidecolor", label: "Color", num_components: 3, default_value: [0.1, 1, 0.2], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ showguide == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "showobjectlink", label: "Show Object Link", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ showguide == 0 }");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "activation", label: "Activation", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DOP/FEM/femregionconstraint',_hnt_DOP_femregionconstraint)
    return _hnt_DOP_femregionconstraint
}
        