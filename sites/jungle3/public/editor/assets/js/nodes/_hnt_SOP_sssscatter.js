
export default function (hou) {
    class _hnt_SOP_sssscatter extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Manipulate/sssscatter';
        static category = '/SOP';
        static houdiniType = 'sssscatter';
        static title = 'SSS Scatter';
        static icon = 'None';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "g0", label: "Cloud Generation", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "t_vizpoly", label: "Visualize Polygonal Conversion", default_value: false});
			hou_parm_template2.setHelp("The pointcloud is built on a polygonal version of the incoming geometry.\\nToggling this on allows you to view the result of the conversion to polygons.\\nThe quality of the conversion can be adjusted with the \"Poly LOD\" parameters below.");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "lodu", label: "Poly LOD in U", num_components: 1, default_value: [3], min: 0, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Increase this number if the polygonal conversion is too coarse.\\nToggle \"Visualize Polygonal Conversion\" to view the conversion.");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "lodv", label: "Poly LOD in V", num_components: 1, default_value: [3], min: 0, max: 5, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Increase this number if the polygonal conversion is too coarse.\\nToggle \"Visualize Polygonal Conversion\" to view the conversion.");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "use_est", label: "Use Estimated Density", default_value: false});
			hou_parm_template2.setScriptCallback("source opdef:/Sop/sssscatter?cb_setest `opfullpath('.')` $script_value est npts inv_store");
			hou_parm_template2.setTags({"autoscope": "0000", "script_callback": "source opdef:/Sop/sssscatter?cb_setest `opfullpath('.')` $script_value est npts inv_store"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "npts", label: "Number of Points", num_components: 1, default_value: [2000], min: 0, max: 10000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ use_est == 1 }");
			hou_parm_template2.setHelp("Manually set the number of points in the cloud");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "curvbias", label: "Curvature Bias", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Dial this up to take into account the surface curvature when scattering the points");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "rseed", label: "Random seed", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Changes the seed of the random number generator used to scatter the points");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "g0_1", label: "Density Estimate", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "sd", label: "Scattering Distance", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("The maximum distance that light is expected to scatter.\\nThis parameter should match the parameter by the same name in the SHOP/VOP");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "nsamp", label: "Super Sample", num_components: 1, default_value: [4], min: 1, max: 20, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm3"});
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "est", label: "Estimated Points:", num_components: 1, default_value: [0], default_expression: ["max( ch(nsamp)*detail(\"./ForGen\",\"Tarea\",0) / ($PI * ch(sd)^2), sqrt(detail(\"./ForGen\",\"Tarea\",0)) * 10*ch(nsamp) )"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ inv_t_est == on } { inv_t_est == off }");
			hou_parm_template2.setTags({"autoscope": "0000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template.setTags({"autoscope": "0000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "inv_t_est", label: "inv_t_est", default_value: true});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"autoscope": "0000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "inv_store", label: "inv_store", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"autoscope": "0000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "execute", label: "Render"});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "trange", label: "Valid Frame Range", menu_items: ["off", "normal", "on"], menu_labels: ["Render Any Frame", "Render Frame Range", "Render Frame Range Only (Strict)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "f", label: "Start/End/Inc", num_components: 3, default_value: [1, 240, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ trange == off }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "sopoutput", label: "Output File", num_components: 1, default_value: ["$HIP/points$F.pc"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l rop_geometry1 sopoutput", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Manipulate/sssscatter',_hnt_SOP_sssscatter)
    return _hnt_SOP_sssscatter
}
        