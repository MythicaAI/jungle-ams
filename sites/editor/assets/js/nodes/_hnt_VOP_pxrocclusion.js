
export default function (hou) {
    class _hnt_VOP_pxrocclusion extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrocclusion';
        static category = '/VOP';
        static houdiniType = 'pxrocclusion';
        static title = 'Pxr Occlusion';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrocclusion.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "numSamples", label: "Num Samples", num_components: 1, default_value: [4], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setHelp("Controls the number of occlusion samples per camera hit point. The default is 4.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "distribution", label: "Sample Distribution", menu_items: ["0", "1", "2"], menu_labels: ["Uniform", "Cosine", "Reflection"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Sample distribution can be uniform, cosine, or reflection. The defaul is cosine.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "cosineSpread", label: "Cosine Spread", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ distribution != 1 }");
			hou_parm_template.setHelp("Sample spread for cosine distribution. The defaul of 1 gives lambertian distribution.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "falloff", label: "Falloff", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Falloff values greater than zero create a softer look. The default is 0.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "maxDistance", label: "Max Distance", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The max distance at which objects may occlude. The default of 0 is infinite.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "useAlbedo", label: "Use Albedo", default_value: false});
			hou_parm_template.setHelp("Tint occlusion by material albedo. The default is 0.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrocclusion',_hnt_VOP_pxrocclusion)
    return _hnt_VOP_pxrocclusion
}
        