
export default function (hou) {
    class _hnt_SOP_labs__delight extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Photogrammetry & Scan/labs::delight';
        static category = '/SOP/labs';
        static houdiniType = 'labs::delight';
        static title = 'Labs Delight';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__delight.svg';
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
			let hou_parm_template = new hou.IntParmTemplate({name: "samples", label: "Number of Samples", num_components: 1, default_value: [50], min: 1, max: 1000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Density of samples over surface. Higher sample numbers generate more accurate results, at a cost of computation time. 50 is a resonable starting number.");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "iterations", label: "Blurring Iterations", num_components: 1, default_value: [30], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("How much to blur the sample colours. At low values the sample regions will be visible as patches. At high values the samples will be overblurred, missing lighting detail. Ideally aim for enough blur to blend the sample patches together. Enabling 'visualize lighting' can help to see how much the patches are being blurred together.");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "grouptype", label: "Group Type", menu_items: ["guess", "breakpoints", "edges", "points", "prims"], menu_labels: ["Guess from Group", "Breakpoints", "Edges", "Points", "Primitives"], default_value: 4, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "ao_brightening", label: "AO Brightening", default_value: false});
			hou_parm_template.setHelp("Toggle to enable the brightening of crevices and overhangs via interted ambient occlusion.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "ao_strength", label: "AO Strength", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ ao_brightening == 0 }");
			hou_parm_template.setHelp("How much to brighten occluded areas. Aim to make crevices blend in with unoccluded neighbouring areas. Values which are too low will appear shadowed, values which are too high will make crevices glow.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "ao_blend_strength", label: "AO Blend Strength", num_components: 1, default_value: [0.75], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ ao_brightening == 0 }");
			hou_parm_template.setHelp("An additional mixing control to blend the edges of the AO regions.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "ao_iterations", label: "AO Blurring Iterations", num_components: 1, default_value: [2], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "ao_tint", label: "AO Tint", num_components: 1, default_value: [0.75], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ ao_brightening == 0 }");
			hou_parm_template.setHelp("Amount to increase the brightness of the AO regions, adjust this until the dark crevices blend into their neighbours.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "lighting_exposure", label: "Lighting Exposure", num_components: 1, default_value: [0], min: null, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Multiplier for the lighting visualizer if it is too overexposed or underexposed in the viewport.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "lighting_saturation", label: "Lighting Saturation", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "vis_lighting", label: "Visualize Lighting", default_value: false});
			hou_parm_template.setHelp("Display the blurred and extracted lighting result only. Useful for debugging to determine if the amount of samples is appropriate, and if the sample blurring iterations is working as expected.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "spacer", label: "_", column_labels: [""]});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "like_tool", label: "Like Tool"});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setHelp("Let us know that you're enjoying this Tool");
			hou_parm_template.setScriptCallback("import gamedevutils;gamedevutils.like_node(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"button_icon": "heart.svg", "script_callback": "import gamedevutils;gamedevutils.like_node(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "dont_like", label: "Thumbs Down"});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setHelp("Let us know you don't like this tool. Ideally also send us a mail at support@sidefx.com");
			hou_parm_template.setScriptCallback("import gamedevutils;gamedevutils.dislike_node(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"button_icon": "thumbs-down.svg", "script_callback": "import gamedevutils;gamedevutils.dislike_node(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Photogrammetry & Scan/labs::delight',_hnt_SOP_labs__delight)
    return _hnt_SOP_labs__delight
}
        