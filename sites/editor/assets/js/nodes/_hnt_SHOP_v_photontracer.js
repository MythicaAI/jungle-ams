
export default function (hou) {
    class _hnt_SHOP_v_photontracer extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/v_photontracer';
        static category = '/SHOP';
        static houdiniType = 'v_photontracer';
        static title = 'Photon Tracer';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_v_photontracer.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SHOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "use_renderstate", label: "Use ROP Parameters", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "cachedirect", label: "Cache Stores Direct Lighting", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_renderstate == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "include_bsdf_color", label: "Include BSDF Color", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "gfile", label: "Global Photon Map", num_components: 1, default_value: ["global.pmap"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_renderstate == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "cfile", label: "Caustic Photon Map", num_components: 1, default_value: ["caustic.pmap"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_renderstate == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/v_photontracer',_hnt_SHOP_v_photontracer)
    return _hnt_SHOP_v_photontracer
}
        