
export default function (hou) {
    class _hnt_SOP_labs__tree_simple_leaf__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/World Building/Vegetation/labs::tree_simple_leaf::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::tree_simple_leaf::1.0';
        static title = 'Labs Tree Simple Leaf';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__tree_simple_leaf__1_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "fd_sizeandsegments", label: "Size and Segments", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_size", label: "Size", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "leaf_size", label: "Leaf Size", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "dist", label: "Length", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "width", label: "Width", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "units": "m1"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_segments", label: "Segments", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.IntParmTemplate({name: "points", label: "Length Segments", num_components: 1, default_value: [8], min: 3, max: 50, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "pos_bias2", label: "Z Bias", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( bspline ) 2pos ( 0.5 ) 2value ( 0.5 ) 2interp ( bspline ) 3pos ( 1 ) 3value ( 1 ) 3interp ( bspline )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "cols", label: "Width Segments", num_components: 1, default_value: [1], min: 1, max: 24, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "pos_bias", label: "X Bias", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( bspline ) 2pos ( 0.50668644905090332 ) 2value ( 0.2083333283662796 ) 2interp ( bspline ) 3pos ( 1 ) 3value ( 1 ) 3interp ( bspline )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_sizeandsegments_1", label: "Shape", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_shapeprofile", label: "Shape Profile", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.MenuParmTemplate({name: "shape_method", label: "Method", menu_items: ["0", "1"], menu_labels: ["1", "2"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "leaf_profile", label: "Leaf Profile", ramp_parm_type: hou.rampParmType.Float, default_value: 6, default_basis: null, color_type: null});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0.083333335816860199 ) 1interp ( bspline ) 2pos ( 0.15110357105731964 ) 2value ( 0.125 ) 2interp ( bspline ) 3pos ( 0.19247467815876007 ) 3value ( 0.1666666716337204 ) 3interp ( bspline ) 4pos ( 0.39363241195678711 ) 4value ( 1 ) 4interp ( bspline ) 5pos ( 0.69175106287002563 ) 5value ( 1 ) 5interp ( bspline ) 6pos ( 1 ) 6value ( 0 ) 6interp ( bspline )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_folding", label: "Folding", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.FloatParmTemplate({name: "folding_amount", label: "Folding Amount", num_components: 1, default_value: [0.005], min: 0, max: 0.01, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "folding", label: "Folding Profile", ramp_parm_type: hou.rampParmType.Float, default_value: 4, default_basis: null, color_type: null});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( bspline ) 2pos ( 0.58755427598953247 ) 2value ( 1 ) 2interp ( bspline ) 3pos ( 0.78002893924713135 ) 3value ( 1 ) 3interp ( bspline ) 4pos ( 1 ) 4value ( 0 ) 4interp ( bspline )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm4"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_bend", label: "Bend", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.FloatParmTemplate({name: "bend", label: "Bend", num_components: 1, default_value: [null], min: null, max: 90, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.RampParmTemplate({name: "bend_profile", label: "Bend Profile", ramp_parm_type: hou.rampParmType.Float, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( bspline ) 2pos ( 0.082442745566368103 ) 2value ( 1 ) 2interp ( bspline ) 3pos ( 1 ) 3value ( 1 ) 3interp ( bspline )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_sizeandsegments_2", label: "Point Jitter", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "scale", label: "Scale", num_components: 1, default_value: [0.005], min: 0, max: 0.1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "seed", label: "Seed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_sizeandsegments_3", label: "Color", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.RampParmTemplate({name: "color", label: "Leaf Color", ramp_parm_type: hou.rampParmType.Color, default_value: 3, default_basis: null, color_type: null});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampcolordefault": "1pos ( 0.24219910800457001 ) 1c ( 0.082999996840953827 0.047102499753236771 0.039922997355461121 ) 1interp ( linear ) 2pos ( 0.36404159665107727 ) 2c ( 0.055466670542955399 0.25600001215934753 0 ) 2interp ( linear ) 3pos ( 1 ) 3c ( 0.15884999930858612 0.3529999852180481 0 ) 3interp ( linear )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "stem_color", label: "Stem Color", ramp_parm_type: hou.rampParmType.Color, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampcolordefault": "1pos ( 0.22436849772930145 ) 1c ( 0.082414209842681885 0.047775756567716599 0.039947167038917542 ) 1interp ( linear ) 2pos ( 0.45319464802742004 ) 2c ( 0.16940000653266907 0.36300000548362732 0 ) 2interp ( linear )", "rampshowcontrolsdefault": "0", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "mix", label: "Mix", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/World Building/Vegetation/labs::tree_simple_leaf::1.0',_hnt_SOP_labs__tree_simple_leaf__1_0)
    return _hnt_SOP_labs__tree_simple_leaf__1_0
}
        