
export default function (hou) {
    class _hnt_LOP_labs__karma_aovs_for_prman_denoiser__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'LOP/Labs/Rendering/Render/labs::karma_aovs_for_prman_denoiser::1.0';
        static category = '/LOP/labs';
        static houdiniType = 'labs::karma_aovs_for_prman_denoiser::1.0';
        static title = 'Labs Karma AOVs for RenderMan Denoiser';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_labs__karma_aovs_for_prman_denoiser__1_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "pathtorenderrop", label: "USD Render ROP", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"opfilter": "!!ROP!!", "oprelative": ".", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "setroptolegacy", label: "Set USD Render ROP to Legacy EXR Mode"});
			hou_parm_template.setScriptCallback("hou.phm().setLegacy(kwargs[\"node\"])");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.phm().setLegacy(kwargs[\"node\"])", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Labs/Rendering/Render/labs::karma_aovs_for_prman_denoiser::1.0',_hnt_LOP_labs__karma_aovs_for_prman_denoiser__1_0)
    return _hnt_LOP_labs__karma_aovs_for_prman_denoiser__1_0
}
        