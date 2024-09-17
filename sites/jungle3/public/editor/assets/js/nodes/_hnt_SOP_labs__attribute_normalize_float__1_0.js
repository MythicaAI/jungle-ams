
export default function (hou) {
    class _hnt_SOP_labs__attribute_normalize_float__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Attribute/labs::attribute_normalize_float::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::attribute_normalize_float::1.0';
        static title = 'Labs Attribute Normalize Float';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__attribute_normalize_float__1_0.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "class", label: "Class", menu_items: ["0", "1", "2"], menu_labels: ["Primitive", "Point", "Vertex"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "attrib", label: "Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "r = []\nnode = kwargs['node']\ninputs = node.inputs()\n\nif inputs and inputs[0]:\n\n    geo = inputs[0].geometry()\n    \n    if geo:\n    \n        c = node.parm('class').evalAsInt()\n        \n        if c == 0:\n            attrs = geo.primAttribs()   \n        elif c == 1:\n            attrs = geo.pointAttribs()\n        elif c == 2:\n            attrs = geo.vertexAttribs()\n        else:\n            attrs = geo.pointAttribs()\n        \n        for a in attrs:\n            if a.dataType() == hou.attribData.Float and not a.isArrayType() and a.size() == 1:\n                r.extend([a.name(), a.name()])\n  \nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "rename", label: "Rename Attribute", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "newname", label: "New Name", num_components: 1, default_value: ["`chs(\"attrib\")`_norm"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ rename == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "keeporig", label: "Keep Original Attribute", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ rename == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "vis", label: "Visualize Output", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_output", label: "Remap Output", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "outrange", label: "Output Range", num_components: 2, default_value: [0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useramp", label: "Remap Output Values", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "remapramp", label: "Output Values over Input Range", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ useramp == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_metadata", label: "Metadata", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "reportlimitvals", label: "Output Original Min/Max Values", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "minmaxprefix", label: "Detail Attribute Prefix", num_components: 1, default_value: ["`chs(\"attrib\")`_o"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ reportlimitvals == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ vis == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.RampParmTemplate({name: "visramp", label: "Visualization Ramp", ramp_parm_type: hou.rampParmType.Color, default_value: 5, default_basis: null, color_type: null});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ vis == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "vecramp_the_basis_strings", "rampbasisdefault": "linear", "rampcolordefault": "1pos ( 0 ) 1c ( 0.20000000298023224 0 1 ) 1interp ( linear ) 2pos ( 0.25 ) 2c ( 0 0.85000002384185791 1 ) 2interp ( linear ) 3pos ( 0.5 ) 3c ( 0 1 0.10000000149011612 ) 3interp ( linear ) 4pos ( 0.75 ) 4c ( 0.94999998807907104 1 0 ) 4interp ( linear ) 5pos ( 1 ) 5c ( 1 0 0 ) 5interp ( linear )", "rampcolortype": "rgb", "rampkeys_var": "vecramp_the_key_positions", "rampshowcontrolsdefault": "0", "rampvalues_var": "vecramp_the_key_values"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Attribute/labs::attribute_normalize_float::1.0',_hnt_SOP_labs__attribute_normalize_float__1_0)
    return _hnt_SOP_labs__attribute_normalize_float__1_0
}
        