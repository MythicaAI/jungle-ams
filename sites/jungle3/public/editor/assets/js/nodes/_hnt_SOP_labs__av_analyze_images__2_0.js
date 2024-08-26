
export default function (hou) {
    class _hnt_SOP_labs__av_analyze_images__2_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Pipeline/Integration/AliceVision/labs::av_analyze_images::2.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::av_analyze_images::2.0';
        static title = 'Labs AV Analyze Images';
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
			let hou_parm_template = new hou.ButtonParmTemplate({name: "cook", label: "Cook"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("hou.pwd().hdaModule().cookNode(hou.pwd())");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().hdaModule().cookNode(hou.pwd())", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "manual_mode", label: "Manual", default_value: true});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bExportLog", label: "Use Log", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Feature Extraction", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "dsc_type", label: "Describer Types", num_components: 1, default_value: ["sift"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["sift", "sift_float", "sift_upright", "akaze", "akaze_liop", "akaze_midb", "cctag3", "cctag4", "sift_ocv", "akaze_ocv"], menu_labels: ["sift", "sift_float", "sift_upright", "akaze", "akaze_liop", "akaze_midb", "cctag3", "cctag4", "sift_ocv", "akaze_ocv"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setHelp("Describer types used to describe an image.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "dsc_pre", label: "Describer Preset", num_components: 1, default_value: ["normal"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["low", "medium", "normal", "high", "ultra"], menu_labels: ["low", "medium", "normal", "high", "ultra"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Control the ImageDescriber configuration. Ultra can take a long time.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "cpu", label: "Force CPU Extraction", default_value: true});
			hou_parm_template2.setHelp("Use only CPU feature extraction.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_1", label: "Image Matching", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.IntParmTemplate({name: "minNImg", label: "Min Number of Images", num_components: 1, default_value: [200], min: 0, max: 500, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Minimum number of images to use the vocabulary tree. If there are fewer features than this threshold, all matching combinations will be computed.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "max_desc", label: "Max Descriptors", num_components: 1, default_value: [500], min: 0, max: 10000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Limit the number of descriptors loaded per image. Zero means no limit.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "nMatch", label: "Number of Matches", num_components: 1, default_value: [50], min: 0, max: 1000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("The number of matches to retrieve for each image. A value of 0 will retrieve all matches.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_2", label: "Feature Matching", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "dsc_type2", label: "Describer Types", num_components: 1, default_value: ["sift"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["sift", "sift_float", "sift_upright", "akaze", "akaze_liop", "akaze_midb", "cctag3", "cctag4", "sift_ocv", "akaze_ocv"], menu_labels: ["sift", "sift_float", "sift_upright", "akaze", "akaze_liop", "akaze_midb", "cctag3", "cctag4", "sift_ocv", "akaze_ocv"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setHelp("Describer types used to describe an image.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1", label: "Advanced", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "photo", label: "Photometric Matching Method", num_components: 1, default_value: ["ANN_L2"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["BRUTE_FORCE_L2", "ANN_L2", "CASCADE_HASHING_L2", "FAST_CASCADE_HASHING_L2", "BRUTE_FORCE_HAMMING"], menu_labels: ["BRUTE_FORCE_L2", "ANN_L2", "CASCADE_HASHING_L2", "FAST_CASCADE_HASHING_L2", "BRUTE_FORCE_HAMMING"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setHelp("For scalar based regions descriptor: \\n*BRUTE_FORCE_L2: L2 BruteForce Matching \\n*ANN_L2: L2 approximate nearest neighbor matching \\n*CASCADE_HASHING_L2: L2 Cascade Hasing matching \\n*FAST_CASCADE_HASHING_L2: L2 Cascade Hasing with precomputed hashed regions (faster than CASCADE_HASHING_L2 but uses more memory) \\nFor binary based descriptor: \\n*BRUTE_FORCE_HAMMING: BruteForce Hamming matching");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "geometricError", label: "Geometric Error", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "geoEst", label: "Geometric Estimator", num_components: 1, default_value: ["acransac"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["acransac", "loransac"], menu_labels: ["acransac", "loransac"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setHelp("Geometric estimator: (acransac: A-Contrario Ransac, loransac: LO-Ransac (only available for \"fundamental_matrix\" model))");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "geoFilter", label: "Geometric Filter type", num_components: 1, default_value: ["fundamental_matrix"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["fundamental_matrix", "essential_matrix", "homography_matrix", "homography_growing", "no_filtering"], menu_labels: ["fundamental_matrix", "essential_matrix", "homography_matrix", "homography_growing", "no_filtering"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setHelp("Geometric validation method to filter features matches: \\n*fundamental_matrix \\n*essential_matrix \\n*homography_matrix \\n*homography_growing \\n*no_filtering");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "dist", label: "Distance Ratio", num_components: 1, default_value: [0.8], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("Distance ratio to discard non meaningful matches.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "maxIter", label: "Max Iteration", num_components: 1, default_value: [2048], min: 1, max: 20000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setHelp("Maximum number of iterations allowed in ransac step.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "maxMatch", label: "Max Matches", num_components: 1, default_value: [0], min: 0, max: 10000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setHelp("Maximum number of matches to keep.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "savePut", label: "Save Putative Matches", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "guide", label: "Guided Matching", default_value: false});
			hou_parm_template3.setHelp("The found model to improvise the pairwise correspondences.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "expDebug", label: "Export Debug Files", default_value: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Pipeline/Integration/AliceVision/labs::av_analyze_images::2.0',_hnt_SOP_labs__av_analyze_images__2_0)
    return _hnt_SOP_labs__av_analyze_images__2_0
}
        