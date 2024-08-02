
export default function (hou) {
    class _hnt_VOP_pxrdebugshadingcontext extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrdebugshadingcontext';
        static category = '/VOP';
        static houdiniType = 'pxrdebugshadingcontext';
        static title = 'Pxr Debug Shading Context';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrdebugshadingcontext.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "viewchannel", label: "viewchannel", num_components: 1, default_value: ["Nn"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["Nn", "Vn", "VLen", "Tn", "InsideOutside", "ST", "dsdu_dtdv", "dsdv_dtdu", "UV", "dudv", "LightLeaks", "P", "dPdu", "dPdv", "dPdtime", "id", "Ngn"], menu_labels: ["Nn", "Vn", "VLen", "Tn", "InsideOutside", "ST", "dsdu_dtdv", "dsdv_dtdu", "UV", "dudv", "LightLeaks", "P", "dPdu", "dPdv", "dPdtime", "id", "Ngn"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("The data to visualize from the shading context.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrdebugshadingcontext',_hnt_VOP_pxrdebugshadingcontext)
    return _hnt_VOP_pxrdebugshadingcontext
}
        