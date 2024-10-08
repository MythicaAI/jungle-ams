
export default function (hou) {
    class _hnt_SOP_labs__straight_skeleton_2D extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Mesh: Convert/labs::straight_skeleton_2D';
        static category = '/SOP/labs';
        static houdiniType = 'labs::straight_skeleton_2D';
        static title = 'Labs Straight Skeleton 2D';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__straight_skeleton_2D.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "resample_res", label: "Resample Size", num_components: 1, default_value: [0.001], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Resample the input and output curves");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "units": "m1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "trim_ends", label: "Trim Ends", default_value: true});
			hou_parm_template.setHelp("Remove the Y end pieces that are common in straight skeletons");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "threshold", label: "Threshold", num_components: 1, default_value: [0.02], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ trim_ends == 0 }");
			hou_parm_template.setHelp("Size Threshold for deleting the end pieces");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fit_to_shape", label: "Fit to Shape", default_value: true});
			hou_parm_template.setHelp("Extends the skeleton ends torwards the original curve");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "recalculate_normal", label: "recalculate_normal", default_value: true});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "normal_menu", label: "Generate Normal As", menu_items: ["0", "1", "2", "3", "4", "5"], menu_labels: ["Tangent", "Normal", "Bitangent", "-Tangent", "-Normal", "-Bitangent"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Mesh: Convert/labs::straight_skeleton_2D',_hnt_SOP_labs__straight_skeleton_2D)
    return _hnt_SOP_labs__straight_skeleton_2D
}
        