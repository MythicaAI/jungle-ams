
export default function (hou) {
    class _hnt_VOP_ocio_transformview extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/ocio_transformview';
        static category = '/VOP';
        static houdiniType = 'ocio_transformview';
        static title = 'OCIO Transform View';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_ocio_transformview.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "from", label: "Source Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "fromspace", label: "From Space", num_components: 1, default_value: ["scene_linear"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').ocioColorSpaceMenu()\")`\n", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "todisplay", label: "To Display", num_components: 1, default_value: ["sRGB - Display"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "echo `pythonexprs(\"__import__(\'toolutils\').ocioDisplayMenu()\")`\n", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "toview", label: "To View", num_components: 1, default_value: ["ACES 1.0 - SDR Video"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import toolutils\nreturn toolutils.ocioViewMenuList(kwargs['node'].evalParm('todisplay'))\n", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/ocio_transformview',_hnt_VOP_ocio_transformview)
    return _hnt_VOP_ocio_transformview
}
        