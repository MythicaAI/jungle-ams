
export default function (hou) {
    class _hnt_SHOP_labs__motionvector_shader extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Labs/Rendering/Shader/labs::motionvector_shader';
        static category = '/SHOP/labs';
        static houdiniType = 'labs::motionvector_shader';
        static title = 'Labs Motionvector Shader';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_labs__motionvector_shader.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "OpenGL", label: "OpenGL", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template.hide(true);
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "ogl_alpha_shader", label: "Shader Alpha", default_value: true});
			hou_parm_template2.setHelp("When present and enabled, this forces a transparency pass. This should be\n    used when a custom shader generates alpha information without using the\n    known GL alpha and texture parameters. If disabled or absent, the material\n    is only considered transparent if one of the alpha parameters is less than \n    one, or the diffuse or opacity texture has non-opaque alpha. If no materials\n    are considered transparent, a transparency pass is not performed.");
			hou_parm_template2.setTags({"cook_dependent": "1", "spare_category": "OpenGL"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "saTexture", label: "Diffuse Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "saMotionVectorTexture", label: "Motion Vector Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fTime", label: "Time", num_components: 1, default_value: [0], default_expression: ["$T"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fSpeed", label: "Speed", num_components: 1, default_value: [0.1], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "fDoubleMotionVector", label: "Apply Double MotionVector", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fRows", label: "Rows", num_components: 1, default_value: [8], min: 1, max: 32, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fCols", label: "Columns", num_components: 1, default_value: [8], min: 1, max: 32, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fDistortion", label: "Distortion", num_components: 1, default_value: [0.041667], min: 0, max: 0.1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Labs/Rendering/Shader/labs::motionvector_shader',_hnt_SHOP_labs__motionvector_shader)
    return _hnt_SHOP_labs__motionvector_shader
}
        