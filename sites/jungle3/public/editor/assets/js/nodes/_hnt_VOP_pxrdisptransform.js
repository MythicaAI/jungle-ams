
export default function (hou) {
    class _hnt_VOP_pxrdisptransform extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrdisptransform';
        static category = '/VOP';
        static houdiniType = 'pxrdisptransform';
        static title = 'Pxr Disp Transform';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrdisptransform.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "dispType", label: "Displacement Type", menu_items: ["1", "2", "3", "4"], menu_labels: ["Scalar", "Generic Vector", "Mudbox Vector", "ZBrush Vector"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Specify the displacement value type. If it is a float procedural, pick Scalar. If it is vector procedural, pick Generic Vector. If the vector displacement map is extracted using Mudbox or Zbrush, pick Mudbox Vector or Zbrush Vector respectively.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispScalar", label: "Scalar Displacement", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Connect a scalar displacement texture or value.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispVector", label: "Vector Displacement", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("Connect a vector displacement texture or value.");
			hou_parm_template.setTags({"script_ritype": "vector"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "vectorSpace", label: "Vector Space", menu_items: ["1", "2", "3", "4"], menu_labels: ["World", "Object", "Tangent", "Current"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ dispType == 1 }");
			hou_parm_template.setHelp("Specify which space the vector was created in. For Mudbox and Zbrush vector type, this would be the space that the vector displacement was exported from. For Mudbox, vector displacement needs to be exported in Absolute Tangent, not Relative Tangent.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispHeight", label: "Displacement Height", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Displacement height applies to the displacement value that is displacing out.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispDepth", label: "Displacement Depth", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Displacement depth applies to the displacement value that is displacing in.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "dispRemapMode", label: "Remapping Mode", menu_items: ["1", "2", "3"], menu_labels: ["None", "Centered", "Interpolate Depth And Height"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: true, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("Specify how to remap the displacement values. 'None' - Reads the displacement value as is without any remapping. Use Displacement Height to scale the displacement. 'Centered' - The displacement value is centered at the Displacement Center specified. If the value is equal to the center, there is no displacement. Any values below that center will be displacing in whereas any values above the center will be displacing out. 'Interpolate Depth and Height' - Fits the displacement depth and height specified through a catmull-rom spline (spline('catmullrom', -depth, -depth, 0, height, height).");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispCenter", label: "Displacement Center", num_components: 1, default_value: [0.5], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ dispRemapMode != 2 }");
			hou_parm_template.setHelp("Displacement center for the 'Centered' Remapping Mode.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "advanced", label: "Advanced", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "dispScaleSpace", label: "Displacement Scale Space", num_components: 1, default_value: ["object"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Space in which displacement units are measured. E.g. 'world', 'object', or user-defined coordinate system.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useDispDirection", label: "Use Displacement Direction", default_value: false});
			hou_parm_template2.setHelp("Displace along the displacement direction provided below instead of along the surface normal.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "dispDirection", label: "Displacement Direction", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ useDispDirection != 1 }");
			hou_parm_template2.setHelp("Displacement will be in the direction this points to rather than along the surface normal. Note that the displacement director vector will be normalized before its use.");
			hou_parm_template2.setTags({"script_ritype": "vector"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "dispDirectionSpace", label: "Displacement Direction Space", num_components: 1, default_value: ["object"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ useDispDirection != 1 }");
			hou_parm_template2.setHelp("Space in which displacement direction vectors are in. E.g. 'world', 'object', or user-defined coordinate system.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrdisptransform',_hnt_VOP_pxrdisptransform)
    return _hnt_VOP_pxrdisptransform
}
        