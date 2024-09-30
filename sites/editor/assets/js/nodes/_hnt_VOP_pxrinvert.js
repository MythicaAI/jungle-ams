
export default function (hou) {
    class _hnt_VOP_pxrinvert extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrinvert';
        static category = '/VOP';
        static houdiniType = 'pxrinvert';
        static title = 'Pxr Invert';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrinvert.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "inputRGB", label: "Input Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("The color that you would like to invert.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "colorModel", label: "Color Model", menu_items: ["0", "1", "2"], menu_labels: ["RGB", "HSL", "HSV"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("The inputColor uses this color model.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invertChannel0", label: "Invert Channel 0", default_value: true});
			hou_parm_template.setHelp("When enabled (set to 1) the first color channel is inverted. For example, if the color model is set to RGB, then the R channel will be inverted.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invertChannel1", label: "Invert Channel 1", default_value: true});
			hou_parm_template.setHelp("When enabled (set to 1) the second color channel is inverted. For example, if the color model is set to RGB, then the G channel will be inverted.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "invertChannel2", label: "Invert Channel 2", default_value: true});
			hou_parm_template.setHelp("When enabled (set to 1) the third color channel is inverted. For example, if the color model is set to RGB, then the B channel will be inverted.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrinvert',_hnt_VOP_pxrinvert)
    return _hnt_VOP_pxrinvert
}
        