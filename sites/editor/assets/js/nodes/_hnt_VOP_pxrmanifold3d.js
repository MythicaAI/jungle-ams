
export default function (hou) {
    class _hnt_VOP_pxrmanifold3d extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrmanifold3d';
        static category = '/VOP';
        static houdiniType = 'pxrmanifold3d';
        static title = 'Pxr Manifold 3D';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrmanifold3d.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "scale", label: "Scale", num_components: 1, default_value: [1], min: null, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Scale the frequency of the feature uniformly in 3D");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "use", label: "Use", menu_items: ["0", "1", "2", "3"], menu_labels: ["Current position: P", "Undisplaced position: Po", "Deform : __Pref", "Deform & transform: __WPref"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Select the type of position you want to use. You can only use __Pref and __WPref if these primitive variables have been attached to your geometry.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "pref", label: "Pref", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Name of geometry Pref (Maya uses __Pref and __WPref). If empty, we will use __Pref or __WPref, depending on the value of 'use'. If all fails, we will use P.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "coordsys", label: "Coordinate System", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Name of coordinate system transform (e.g. place3dtexture node in Maya). Standard coordinate systems : 'object', 'world', 'screen', 'NDC'. If empty, we assume 'object' space, which is fine for non-deforming geometry.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrmanifold3d',_hnt_VOP_pxrmanifold3d)
    return _hnt_VOP_pxrmanifold3d
}
        