
export default function (hou) {
    class _hnt_VOP_pxrdiffuse extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrdiffuse';
        static category = '/VOP';
        static houdiniType = 'pxrdiffuse';
        static title = 'Pxr Diffuse';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrdiffuse.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "diffuseColor", label: "diffuseColor", num_components: 3, default_value: [0.5, 0.5, 0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Diffuse color. Also referred to as albedo.");
			hou_parm_template.setTags({"ogl_diff": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "transmissionBehavior", label: "transmissionBehavior", menu_items: ["0", "1", "2", "3"], menu_labels: ["None", "ShadowsOnly", "ScatterOnly", "ShadowsAndScatter"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Select a transmission behavior. Only relevant when transmissionColor is non-zero.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "transmissionColor", label: "transmissionColor", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Transmission color. When 0, no energy is transferred accross the surface. When non-zero, lighting may be more costly but light (and shadows) from back-side of a surface can be seen. Behavior of this color is determined by transmissionBehavior parameter.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "presence", label: "presence", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("A cutout for the geometry. This should usually be a mask/cutout pattern comprised predominantly of black and/or white values.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "bumpNormal", label: "bumpNormal", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("An optional connection point for bumped normals.");
			hou_parm_template.setTags({"script_ritype": "normal"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrdiffuse',_hnt_VOP_pxrdiffuse)
    return _hnt_VOP_pxrdiffuse
}
        