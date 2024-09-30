
export default function (hou) {
    class _hnt_SOP_labs__destruction_cleanup extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Simulation & FX/Destruction/labs::destruction_cleanup';
        static category = '/SOP/labs';
        static houdiniType = 'labs::destruction_cleanup';
        static title = 'Labs Destruction Cleanup';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "alwaysTrue", label: "True", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "thirdinput", label: "ThirdIsConnected", num_components: 1, default_value: [0], default_expression: ["opexist(opinputpath('.',2))"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "fourthinput", label: "FourthIsConnected", num_components: 1, default_value: [0], default_expression: ["opexist(opinputpath('.',3))"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm5"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "inputMode", label: "Input Mode", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1"], menu_labels: ["DOP", "Cache"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template.setHelp("The input mode specifies what kind of data is being fed into the tool. If you get displaced objects on the first frame, select another option.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "outputMode", label: "Output Mode", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["0", "1", "2"], menu_labels: ["Animated Optimized Geometry", "Static Optimized Geometry", "Animated Transforms"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The output mode determines what kind of data the tool gives back to you after being processed.");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "simulationRange", label: "Simulation Range", num_components: 2, default_value: [0, 0], default_expression: ["$RFSTART", "$RFEND"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("The simulation range determines what the framerange is that will be used for the data analysis. It is recommended to leave these to the start and end frame of your simulation.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm6"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Optimization Mode", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "tab_", label: "Proximity Based", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm11"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bExcludeDisconnected", label: "Exclude Disconnected Chunks", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ fourthinput == 0 }");
			hou_parm_template3.setHelp("This checkbox allows the user to exclude any chunks which are completely isolated at the last frame (Simulation Range) from being batched by proximity cleanup.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clusterSearchRadius", label: "Cluster Search Radius", num_components: 1, default_value: [0.21], min: 0.0001, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setHelp("The cluster search radius specifies the maximum difference in units between chunks in a simulation. A lower value means chunks have to be closer to eachother throughout their animation to be batched together, while a higher value will increase the allowed distance.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "tab__1", label: "Constraint Based", folder_type: hou.folderType.RadioButtons, default_value: 0, ends_tab_group: false});
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.LabelParmTemplate({name: "labelparm", label: "Label", column_labels: ["USES CONSTRAINT NETWORK FROM INPUT 4"]});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder1", label: "Shared Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm16"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bFuseSurface", label: "Fuse", default_value: true});
			hou_parm_template2.setHelp("This controls if surface points should be fused together. This will also trigger the removal of inside faces.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "fuseDistance", label: "Fuse Distance", num_components: 1, default_value: [0.001], min: 0, max: 0.005, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bFuseSurface == 0 }");
			hou_parm_template2.setHelp("This controls the fusing threshold in units for surface points close to eachother");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "removeInline", label: "Remove Inline Points", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bFuseSurface == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm9"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bFreezeThreshold", label: "Freeze Threshold", default_value: false});
			hou_parm_template2.setHelp("This controls the freeze threshold optimization. Chunks that move less than the specified threshold will be batched together.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "freezeThreshold", label: "Freeze Threshold", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bFreezeThreshold == 0 }");
			hou_parm_template2.setHelp("This is the threshold in units used to determine freezing of chunks. See checkbox tooltip for more.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm8"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bCuspPolygons", label: "Cusp Polygons", default_value: true});
			hou_parm_template2.setHelp("This controls if polygon cusping should be applied to the newly generated geometry.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "cuspAngle", label: "Cusp Angle", num_components: 1, default_value: [30], min: 0, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template2.setHelp("This controls the polygon cusping angle.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm4"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bGenerateName", label: "Generate Name", default_value: true});
			hou_parm_template2.setHelp("This controls whether or not a new name attribute should be generated per unique optimized packed primitive");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "newName", label: "Name", num_components: 1, default_value: ["piece"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bGenerateName == 0 }");
			hou_parm_template2.setHelp("This controls the prefix applied to packed primitives coming out of the output.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm17"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bVisChunks", label: "Visualize Chunks", default_value: true});
			hou_parm_template2.setHelp("This controls whether or not unique chunks should be colorcoded.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "explodeView", label: "Explode View", num_components: 1, default_value: [0], min: 0, max: 3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bVisChunks == 0 } { outputMode != 1 }");
			hou_parm_template2.setHelp("NOTE: Requires Output Mode to be set to \"Static Optimized Geometry\". This parameter controls the scale at which each piece has to be expanded from the geometry it\'s center.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm7"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bBoundsAdjust", label: "Clamped Bounds", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ thirdinput == 0 }");
			hou_parm_template2.setHelp("This controls whether or not to apply bound optimization.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "clampPos", label: "Clamp Position", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bBoundsAdjust == 0 } { thirdinput == 0 }");
			hou_parm_template2.setHelp("This controls the where bound clamped chunks will be moved to.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Simulation & FX/Destruction/labs::destruction_cleanup',_hnt_SOP_labs__destruction_cleanup)
    return _hnt_SOP_labs__destruction_cleanup
}
        