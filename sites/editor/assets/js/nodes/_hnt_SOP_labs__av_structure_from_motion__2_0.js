
export default function (hou) {
    class _hnt_SOP_labs__av_structure_from_motion__2_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/AliceVision/labs::av_structure_from_motion::2.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::av_structure_from_motion::2.0';
        static title = 'Labs AV Structure from Motion';
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
			hou_parm_template = new hou.ButtonParmTemplate({name: "reload", label: "Reload"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "manual_mode", label: "Manual", default_value: true});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bExportLog", label: "Use Log", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Structure from Motion", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "dsc_type", label: "Describer Types", num_components: 1, default_value: ["sift"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["sift", "sift_float", "sift_upright", "akaze", "akaze_liop", "akaze_midb", "cctag3", "cctag4", "sift_ocv", "akaze_ocv"], menu_labels: ["sift", "sift_float", "sift_upright", "akaze", "akaze_liop", "akaze_midb", "cctag3", "cctag4", "sift_ocv", "akaze_ocv"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setHelp("Describer types used to describe an image.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "locl_es", label: "Localizer Estimator", num_components: 1, default_value: ["acransac"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["acransac", "ransac", "lsmeds", "loransac", "maxconsensus"], menu_labels: ["acransac", "ransac", "lsmeds", "loransac", "maxconsensus"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Estimator type used to localize cameras (acransac, ransac, lsmeds, loransac, maxconsensus).");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "maxN", label: "Max Num of Matches", num_components: 1, default_value: [0], min: 0, max: 50000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Maximum number of matches per image pair (and per feature type). This can be useful to have a quick reconstruction overview. A value of 0 is no limit.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "fileExt", label: "Inter File Extension", num_components: 1, default_value: [".abc"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [".abc", ".ply"], menu_labels: [".abc", ".ply"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "folder1", label: "Advanced", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "lock", label: "Lock Scene Previously Reconstructed", default_value: false});
			hou_parm_template3.setHelp("This option is useful for SfM augmentation. Lock previous reconstructed poses and intrinsics.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "local", label: "Local Bundle Adjustment", default_value: true});
			hou_parm_template3.setHelp("Reduces the reconstruction time, especially for large datasets (500+ images), by avoiding computation of the Bundle Adjustment on areas that are not changing.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "useInputMatches", label: "Use Only Inputfolder Matches", default_value: true});
			hou_parm_template3.setHelp(" Use only matches from the input                                          matchesFolder parameter.                                         Matches folders previously added to the                                         SfMData file will be ignored.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "lockAllIntrinsics", label: "Force Lock of All Intrinsic Camera Parameters", default_value: false});
			hou_parm_template3.setHelp("Force to keep constant all the intrinsics parameters of the cameras (focal length, \\n'                         'principal point, distortion if any) during the reconstruction.\\n'                         'This may be helpful if the input cameras are already fully calibrated");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "useRigConstraint", label: "Use Rig Constraint", default_value: true});
			hou_parm_template3.setHelp("Enable/Disable rig constraint");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "localizerEstimatorMaxIterations", label: "Localizer Max Ransac Error", num_components: 1, default_value: [4096], min: 1, max: 20000, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setHelp("Maximum number of iterations allowed in ransac step.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "ba", label: "LocalBA Graph Distance", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setHelp("Graph-distance limit to define the active region in the Local Bundle Adjustment strategy.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "minInput", label: "Min Input Track Length", num_components: 1, default_value: [2], min: 2, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setHelp("Minimum track length in input of SfM.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "minTri", label: "Min Observation for Triangulation", num_components: 1, default_value: [2], min: 2, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setHelp("Minimum number of observations to triangulate a point. Setting to 3 (or more) drastically reduces the noise in the point cloud, but the number of final poses is reduced.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "minAngle", label: "Min Angle for Triangulation", num_components: 1, default_value: [3], min: 0.1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "localizerEstimatorError", label: "Localizer Max Ransac Error", num_components: 1, default_value: [0], min: 0, max: 100, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("Maximum error (in pixels) allowed for camera localization (resectioning).\\n'                         'If set to 0, it will select a threshold according to the localizer estimator used\\n'                         '(if ACRansac, it will analyze the input data to select the optimal value).");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "minLandmark", label: "Min Angle for Landmark", num_components: 1, default_value: [2], min: 0.1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "maxReprEr", label: "Max Reprojection Error", num_components: 1, default_value: [4], min: 0.1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "minAngInit", label: "Min Angle Initial Pair", num_components: 1, default_value: [5], min: 0.1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "maxAngInit", label: "Max Angle Initial Pair", num_components: 1, default_value: [40], min: 0.1, max: 60, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0_1", label: "Prepare Dense Scene", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "outputFileType", label: "Output File Type", num_components: 1, default_value: ["exr"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["jpg", "png", "tif", "exr"], menu_labels: ["jpg", "png", "tif", "exr"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Output file type for the undistorted images.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "saveMetadata", label: "Save Metadata", default_value: true});
			hou_parm_template2.setHelp("Save projections and intrinsics information in images metadata (only for .exr images).");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "saveMatricesTxtFiles", label: "Save Matrices Text Files", default_value: false});
			hou_parm_template2.setHelp("Save projections and intrinsics information in text files.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/AliceVision/labs::av_structure_from_motion::2.0',_hnt_SOP_labs__av_structure_from_motion__2_0)
    return _hnt_SOP_labs__av_structure_from_motion__2_0
}
        