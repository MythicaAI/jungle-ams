
export default function (hou) {
    class _hnt_VOP_pxrfacingratio extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrfacingratio';
        static category = '/VOP';
        static houdiniType = 'pxrfacingratio';
        static title = 'Pxr Facing Ratio';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrfacingratio.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "parameters", label: "Parameters", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "use", label: "Use", menu_items: ["0", "1"], menu_labels: ["Camera", "Direction"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setHelp("Traditionnaly, the facing ratio is computed using the surface normal and the camera vector : This is the Camera mode. It can also be useful to the surface normal with an arbitrary direction, for example to create a dust mask on up-facing parts of a model : This is the Direction mode.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "direction", label: "Direction", num_components: 3, default_value: [0, 1, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("Only active in Direction mode. Defines an direction of your choice");
			hou_parm_template2.setTags({"script_ritype": "vector"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "coordSys", label: "Coordinate System", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("By default, the direction is in current space. Possible coordinate systems include world, object, or an user defined coordinate system.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "faceForward", label: "Face Forward", default_value: true});
			hou_parm_template2.setHelp("The facing ratio can be negative if the normal is pointing away from the camera. This will flip the normal to always give a positive result.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "clamp", label: "clamp", default_value: false});
			hou_parm_template2.setHelp("Clamps the result between 0 and 1.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "invert", label: "Invert", default_value: false});
			hou_parm_template2.setHelp("Inverts the facing ratio : black becomes white and vice-versa.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "gamma", label: "Gamma", num_components: 1, default_value: [1], min: 0.01, max: 4, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("A simple gamma function to shape the facing ratio. A value of 1.0 is neutral");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "bumpNormal", label: "Bump Normal", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setHelp("If the surface is bump-mapped, input the bump normal here. If not connected, the node will use ths shading normal.");
			hou_parm_template2.setTags({"script_ritype": "normal"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrfacingratio',_hnt_VOP_pxrfacingratio)
    return _hnt_VOP_pxrfacingratio
}
        