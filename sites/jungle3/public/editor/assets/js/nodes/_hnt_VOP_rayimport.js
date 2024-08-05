
export default function (hou) {
    class _hnt_VOP_rayimport extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/rayimport';
        static category = '/VOP';
        static houdiniType = 'rayimport';
        static title = 'Ray Import';
        static icon = 'None';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
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
			hou_parm_template = new hou.StringParmTemplate({name: "var", label: "Variable Name", num_components: 1, default_value: ["ray:origin"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["ray:origin", "ray:direction", "ray:length", "ray:area", "ray:solidangle", "diffuselevel", "reflectlevel", "refractlevel", "volumelevel"], menu_labels: ["Ray Origin (vector)", "Ray Direction (vector", "Ray Length (float)", "Ray Area (float)", "Ray Solid Angle (float)", "PBR Diffuse Bounce Level (int)", "PBR Reflect Bounce Level (int)", "PBR Refract Bounce Level (int)", "PBR Volume Bounce Level (int)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/rayimport',_hnt_VOP_rayimport)
    return _hnt_VOP_rayimport
}
        