
export default function (hou) {
    class _hnt_VOP_pxrvisualizer extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrvisualizer';
        static category = '/VOP';
        static houdiniType = 'pxrvisualizer';
        static title = 'Pxr Visualizer';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrvisualizer.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "style", label: "style", num_components: 1, default_value: ["shaded"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["bxdf", "shaded", "flat", "normals", "st", "matcap"], menu_labels: ["bxdf", "shaded", "flat", "normals", "st", "matcap"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("bxdf: renders the scene as if the scene was lit with a single light at the camera's position. shaded: Simple N dot V shading. Normals are flipped if inverted. flat: Uses a random flat color based on the object's id. normals: displays normals in object space. st: normalized st coordinates. Handy to visualize UDIM tiles. matcap: material capture. Uses the surface normal to look up color in an environment map.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "wireframe", label: "wireframe", default_value: true});
			hou_parm_template.setHelp("Overlays wireframe. The default is on.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "normalCheck", label: "normalCheck", default_value: false});
			hou_parm_template.setHelp("Colors geometry with inverted normals bright orange.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "matCap", label: "MatCap Texture", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setHelp("Material capture environment map used when style is 'matcap'. The surface normal is used to look up a color in this texture.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "wireframe_settings", label: "Wireframe Settings", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "wireframeColor", label: "Wireframe Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "wireframeOpacity", label: "Wireframe Opacity", num_components: 1, default_value: [0.5], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "wireframeWidth", label: "Wireframe Width", num_components: 1, default_value: [1], min: 0, max: 4, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrvisualizer',_hnt_VOP_pxrvisualizer)
    return _hnt_VOP_pxrvisualizer
}
        