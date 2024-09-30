
export default function (hou) {
    class _hnt_LOP_componentgeometryvariants extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/USD Model Assets/Component/componentgeometryvariants';
        static category = '/LOP';
        static houdiniType = 'componentgeometryvariants';
        static title = 'Component Geometry Variants';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_componentgeometryvariants.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP', 'LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "variantset", label: "Variant Set", num_components: 1, default_value: ["geo"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "variantsource", label: "Source Mode", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["Inputs", "Number"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "variantcount", label: "Number of Variants", num_components: 1, default_value: [1], min: 1, max: 15, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ variantsource != 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "variantnamesrc", label: "Variant Name Source", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["Component Geometry Inputs", "Manual"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ variantsource != 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "variantprefix", label: "Prefix", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ variantsource != 0 } { variantnamesrc != 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "variantname", label: "Variant Name", num_components: 1, default_value: ["`$OS`_`@input`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ variantsource != 0 } { variantnamesrc != 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "variantcountname", label: "Variant Name", num_components: 1, default_value: ["`$OS`_`@index`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ variantsource != 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "setcurrentselection", label: "Set Current Selection", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "variantname1", label: "Working Variant", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a choosevariant variantname1", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ setcurrentselection != 1 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "labelparm", label: "Label", column_labels: ["Variant Names for each input are set by the Component Geometry node, under Advanced > Geo Variant Name."]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ variantsource != 0 } { variantnamesrc != 0 }");
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "labelparm2", label: "Label", column_labels: ["The variant name can only be set on this node, when 'Source' is set to 'Number'."]});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ variantsource != 1 }");
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/USD Model Assets/Component/componentgeometryvariants',_hnt_LOP_componentgeometryvariants)
    return _hnt_LOP_componentgeometryvariants
}
        