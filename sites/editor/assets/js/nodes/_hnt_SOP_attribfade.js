
export default function (hou) {
    class _hnt_SOP_attribfade extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Attribute/attribfade';
        static category = '/SOP';
        static houdiniType = 'attribfade';
        static title = 'Attribute Fade';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_attribfade.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "visualize", label: "Visualize Fade", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Point Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a vopsop1 vex_group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action": "import soputils\nkwargs['geometrytype'] = hou.geometryType.Points\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Attributes", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "fadeattrib", label: "Fade", num_components: 1, default_value: ["fade"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs['node'].generateInputAttribMenu(0, hou.attribType.Point)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "startattrib", label: "Fade Start Frame", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs['node'].generateInputAttribMenu(1 if node.input(1) else 0, hou.attribType.Point, hou.attribData.Float, max_size=1, array_type=False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "startremap", label: "Start Frame Retime", num_components: 2, default_value: [0, 1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "durationattrib", label: "Hold Scale", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs['node'].generateInputAttribMenu(2 if node.input(2) else 0, hou.attribType.Point, hou.attribData.Float, max_size=1, array_type=False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_1", label: "Timings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "fadeoffset", label: "Frame Offset", num_components: 1, default_value: [0], min: null, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "fadein", label: "Fade In Frames", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "fadehold", label: "Fade Hold Frames", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "fadeout", label: "Fade Out Frames", num_components: 1, default_value: [2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "fadein_ramp", label: "Fade In Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "fadein_ramp_the_basis_strings", "rampbasisdefault": "monotonecubic", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampkeys_var": "fadein_ramp_the_key_positions", "rampshowcontrolsdefault": "0", "rampvalues_var": "fadein_ramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "fadeout_ramp", label: "Fade Out Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "parmvop": "1", "rampbasis_var": "fadeout_ramp_the_basis_strings", "rampbasisdefault": "monotonecubic", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 0 ) 2interp ( linear )", "rampkeys_var": "fadeout_ramp_the_key_positions", "rampshowcontrolsdefault": "0", "rampvalues_var": "fadeout_ramp_the_key_values", "shaderparmcontexts": "cvex"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Attribute/attribfade',_hnt_SOP_attribfade)
    return _hnt_SOP_attribfade
}
        