
export default function (hou) {
    class _hnt_SOP_labs__path_deform extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Mesh: Deform/labs::path_deform';
        static category = '/SOP/labs';
        static houdiniType = 'labs::path_deform';
        static title = 'Labs Path Deform';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__path_deform.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "fd_basesettings", label: "Base Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "axis", label: "Axis", menu_items: ["0", "1", "2", "3", "4", "5"], menu_labels: ["+X", "+Y", "+Z", "-X", "-Y", "-Z"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setHelp("Which axis to align along the curve. Eg, the tommy sop has his head pointing up on Y, so the axis to choose is +Y.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "curve_offset", label: "Curve Offset", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Where to place geometry on the curve. 0 is the start, 1 is the end. Animate this value to move your geo down the curve.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "curve_resolution", label: "Curve Resolution", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Quality of the curve resample used internally. Higher values will deform the geometry more accurately, but can slow performance.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "normal_blur", label: "Normal Blur Strength", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setHelp("Softens some of the extreme deformation when the curve is too noisy");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "clip_min", label: "Clip Bottom End", default_value: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setHelp("Toggle to clip the geo if it extends before the start of the curve.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "clip_max", label: "Clip Top End", default_value: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setHelp("Toggle to clip the geo if it extends beyond the end of the curve.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "collapse", label: "Collapse Instead of Clip", default_value: true});
			hou_parm_template2.setHelp("Toggle to 'crunch' the geo at the ends rather than clip it and change the point count.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_scalecontrols", label: "Scale Controls", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "scale_to_length", label: "Scale To Curve Length", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Stretch the geo along the curve. A value of 1 will make the geo take up the entire length of the curve.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "scale", label: "Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Scale the input geometry perpendicular to the curve.");
			hou_parm_template2.setTags({"autoscope": "0000000000000000"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "scaleramp", label: "Scale Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setHelp("Ramp to control scale along the length of the curve, left side of the ramp represents the start of the curve, right side the end. This value is multiplied against the scale parameter.");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 1 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampshowcontrolsdefault": "0"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_twistcontrols", label: "Twist Controls", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "twist", label: "Twist", num_components: 1, default_value: [0], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Twist the geometry along the tangent of the curve. Note that more controllable results can be achieved by pre-rotating the input geometry.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.RampParmTemplate({name: "twist_ramp", label: "Twist Ramp", ramp_parm_type: hou.rampParmType.Float, default_value: 2, default_basis: null, color_type: null});
			hou_parm_template2.setHelp("Ramp to drive twist along the length of the curve.");
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "rampfloatdefault": "1pos ( 0 ) 1value ( 0 ) 1interp ( linear ) 2pos ( 1 ) 2value ( 1 ) 2interp ( linear )", "rampshowcontrolsdefault": "0"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
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
    hou.registerType('SOP/Labs/Geometry/Mesh: Deform/labs::path_deform',_hnt_SOP_labs__path_deform)
    return _hnt_SOP_labs__path_deform
}
        