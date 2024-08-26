
export default function (hou) {
    class _hnt_SOP_labs__destruction_cleanup__2_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/FX/Destruction/labs::destruction_cleanup::2.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::destruction_cleanup::2.0';
        static title = 'Labs Destruction Cleanup';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__destruction_cleanup__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
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
			hou_parm_template = new hou.IntParmTemplate({name: "thirdinput", label: "ThirdIsConnected", num_components: 1, default_value: [0], default_expression: ["opexist(opinputpath('.',1))"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_basic", label: "Basic", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.IntParmTemplate({name: "simulationRange", label: "Simulation Range", num_components: 2, default_value: [0, 0], default_expression: ["$RFSTART", "$RFEND"], default_expression_language: [hou.scriptLanguage.Hscript, hou.scriptLanguage.Hscript], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("The simulation range determines what the framerange is that will be used for the data analysis. It is recommended to leave these to the start and end frame of your simulation.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bVisChunks", label: "Visualize Chunks", default_value: false});
			hou_parm_template2.setHelp("This controls whether or not unique chunks should be colorcoded.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_cleanup", label: "Cleanup Properties", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_insides", label: "Insides", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "bFuseSurface", label: "Remove Insides", default_value: true});
			hou_parm_template3.setHelp("This controls if surface points should be fused together. This will also trigger the removal of inside faces.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "fuseDistance", label: "Fuse Distance", num_components: 1, default_value: [0.001], min: 0, max: 0.005, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bFuseSurface == 0 }");
			hou_parm_template3.setHelp("This controls the fusing threshold in units for surface points close to eachother");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_cusping", label: "Cusping", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bCuspPolygons", label: "Cusp Polygons", default_value: false});
			hou_parm_template3.setHelp("This controls if polygon cusping should be applied to the newly generated geometry.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "mCuspMode", label: "Cusp", menu_items: ["0", "1"], menu_labels: ["Inside / Outside Together", "Inside / Outside Separately"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "insideprims", label: "Inside Primitives", num_components: 1, default_value: ["inside"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l normal1 group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "cuspangle", label: "Inside Cusp Angle", num_components: 1, default_value: [60], min: 0, max: 180, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 0 }");
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "method2", label: "Weighting Method", num_components: 1, default_value: [1], min: 0, max: 2, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["uniform", "angle", "area"], menu_labels: ["Each Vertex Equally", "By Vertex Angle", "By Face Area"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 0 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "outsideprims", label: "Outside Primitives", num_components: 1, default_value: ["outside"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l normal4 group", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 0 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "cuspangle2", label: "Outside Cusp Angle", num_components: 1, default_value: [60], min: 0, max: 180, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 0 }");
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "method3", label: "Weighting Method", num_components: 1, default_value: [2], min: 0, max: 2, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["uniform", "angle", "area"], menu_labels: ["Each Vertex Equally", "By Vertex Angle", "By Face Area"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 0 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "cuspAngle", label: "Cusp Angle", num_components: 1, default_value: [60], min: 0, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 1 }");
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template3.setHelp("This controls the polygon cusping angle.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.IntParmTemplate({name: "method", label: "Weighting Method", num_components: 1, default_value: [2], min: 0, max: 2, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: ["uniform", "angle", "area"], menu_labels: ["Each Vertex Equally", "By Vertex Angle", "By Face Area"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bCuspPolygons == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ mCuspMode == 1 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setTags({"autoscope": "0000000000000000"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_piecenames", label: "Piece Names", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bGenerateName", label: "Generate Name", default_value: true});
			hou_parm_template3.setHelp("This controls whether or not a new name attribute should be generated per unique optimized packed primitive");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "newName", label: "Name", num_components: 1, default_value: ["piece"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bGenerateName == 0 }");
			hou_parm_template3.setHelp("This controls the prefix applied to packed primitives coming out of the output.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_advanced", label: "Advanced", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "optimizeIntoChunks", label: "Optimize Pieces Into Chunks", default_value: true});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bFreezeThreshold", label: "Freeze Threshold", default_value: false});
			hou_parm_template3.setHelp("This controls the freeze threshold optimization. Chunks that move less than the specified threshold will be batched together.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "freezeThreshold", label: "Freeze Threshold", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bFreezeThreshold == 0 }");
			hou_parm_template3.setHelp("This is the threshold in units used to determine freezing of chunks. See checkbox tooltip for more.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bBoundsAdjust", label: "Clamped Bounds", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ thirdinput == 0 }");
			hou_parm_template3.setHelp("This controls whether or not to apply bound optimization.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "clampPos", label: "Clamp Position", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ bBoundsAdjust == 0 } { thirdinput == 0 }");
			hou_parm_template3.setHelp("This controls the where bound clamped chunks will be moved to.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "attribname", label: "Transfer Attributes", num_components: 1, default_value: ["orient pivot rest w"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l attribcopy2 attribname", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringToggle});
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "sop_input": "2else1"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/FX/Destruction/labs::destruction_cleanup::2.0',_hnt_SOP_labs__destruction_cleanup__2_0)
    return _hnt_SOP_labs__destruction_cleanup__2_0
}
        