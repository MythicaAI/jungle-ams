
export default function (hou) {
    class _hnt_VOP_rsl_renderstate extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/rsl_renderstate';
        static category = '/VOP';
        static houdiniType = 'rsl_renderstate';
        static title = 'Render State Information';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "signature", label: "Signature", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_isparm": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "func", label: "Import from", num_components: 1, default_value: ["attribute"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["attribute", "option", "rendererinfo"], menu_labels: ["Import Attribute", "Import Option", "Renderer Information"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_unquoted": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "var", label: "Value Name", num_components: 1, default_value: ["identifier:name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ShadingRate", "Sides", "matte", "GeometricApproximateion:motionfactor", "displacementbound:sphere", "displacementbound:coordinatesystem", "identifier:name", "FrameAspectRatio", "Hider", "renderer", "versionstring"], menu_labels: ["A: Shading Rate [float]", "A: Sides Attribute [float]", "A: Matte Attribute [float]", "A: Motion Factor [float]", "A: Displacement Bound [float]", "A: Displacement Coordinate System [string]", "A: Object Name [string]", "O: Frame Aspect Ratio [float]", "O: Hider [string]", "R: Renderer Name [string]", "R: Renderer Version [string]"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "default", label: "Default Value", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "default_s", label: "Default String", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/rsl_renderstate',_hnt_VOP_rsl_renderstate)
    return _hnt_VOP_rsl_renderstate
}
        