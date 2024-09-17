
export default function (hou) {
    class _hnt_VOP_pxrcamera extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrcamera';
        static category = '/VOP';
        static houdiniType = 'pxrcamera';
        static title = 'Pxr Camera';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrcamera.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "standard_perspective", label: "Standard Perspective", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "fov", label: "Field of View", num_components: 1, default_value: [90], min: 1, max: 135, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Field of view (FOV) in degrees. For rectangular images this is normally the FOV along the narrower image dimension.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "standard_perspective_1", label: "Tilt-Shift", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "tilt", label: "Tilt Angle", num_components: 1, default_value: [0], min: null, max: 20, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Angle in degrees to tilt the lens. Makes the plane of focus non-parallel to the image plane. Has no effect unless depth of field is enabled. Positive tilts up, bringing the focus in the top of the image closer and pushing the focus in the bottom further. Negative does the reverse. Ignored if focus points are set.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "roll", label: "Roll Angle", num_components: 1, default_value: [0], min: null, max: 180, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Roll the lens clockwise. If the lens tilt is non-zero this can be used to rotate the plane of focus around the image center. Ignored if focus points are set.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "focus1", label: "Focus 1", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("First point to keep in focus. Specified in world space. If all three focus points are set then the tilt angles and focal distance will be automatically solved to match the plane of focus they define. Note that there may not be a solution.");
			hou_parm_template2.setTags({"script_ritype": "point"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "focus2", label: "Focus 2", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Second point to keep in focus. Specified in world space. If all three focus points are set then the tilt angles and focal distance will be automatically solved to match the plane of focus they define. Note that there may not be a solution.");
			hou_parm_template2.setTags({"script_ritype": "point"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "focus3", label: "Focus 3", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Third point to keep in focus. Specified in world space. If all three focus points are set then the tilt angles and focal distance will be automatically solved to match the plane of focus they define. Note that there may not be a solution.");
			hou_parm_template2.setTags({"script_ritype": "point"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "shiftX", label: "Shift X", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Shift the lens horizontally. This can be used to correct for perspective distortion. Positive values shift towards the right.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "shiftY", label: "Shift Y", num_components: 1, default_value: [0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Shift the lens vertically. This can be used to correct for perspective distortion 'keystone' effects. To keep vertical lines parallel, aim the camera horizontally and adjust this to include the subject. Positive values shift towards the top.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "standard_perspective_2", label: "Lens Distortion", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "radial1", label: "Radial Distortion 1", num_components: 1, default_value: [0], min: null, max: 0.3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Quadratic radial lens distortion coefficient. Positive values produce pincushion distortion. Negative values produce barrel distortion.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "radial2", label: "Radial Distortion 2", num_components: 1, default_value: [0], min: null, max: 0.3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Quartic radial lens distortion coefficient. Positive values produce pincushion distortion. Negative values produce barrel distortion.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "assymX", label: "Assymetric Distortion X", num_components: 1, default_value: [0], min: null, max: 0.3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Distortion applied only in the X direction. Horizontal lines will remain straight. Positive values produce pincushion-like distortion. Negative values produce barrel-like distortion.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "assymY", label: "Assymetric Distortion Y", num_components: 1, default_value: [0], min: null, max: 0.3, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Distortion applied only in the Y direction. Vertical lines will remain straight. Positive values produce pincushion-like distortion. Negative values produce barrel-like distortion.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "squeeze", label: "Anamorphic Squeeze", num_components: 1, default_value: [1], min: 0.5, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Anamorphic lens squeeze. Values greater than one decrease the effect of the lens distortion in the X direction. Values less than one increase it.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "standard_perspective_3", label: "Chromatic Aberration", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "transverse", label: "Transverse", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Transverse (or lateral) chromatic aberration. This specifies the magnification factors for the red, green, and blue primaries respectively. When unequal, this can produce a tinge which is most pronounced near the image edges. It will increase color noise, however.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "axial", label: "Axial", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template2.setHelp("Axial (or longitudinal) chromatic aberration. This specifies the chromatic focal shift for the red, green, and blue primaries respectively. When unequal, this can produce a tinge on bokeh and out of focus objects. It will increase color noise, however.");
			hou_parm_template2.setTags({"script_ritype": "color"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "standard_perspective_4", label: "Vignetting", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.FloatParmTemplate({name: "natural", label: "Natural", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Natural vignetting. When one, directions off of the primary camera axis will be darkened realistically. Wide-angle perspectives will show this effect more strongly. Setting to zero disables this and intermediate values will blend accordingly.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "optical", label: "Optical", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Optical vignetting. Simulates light blockage due to a hood or other additional lens elements. With depth of field enabled, this creates cat's eye bokeh. However, it also increases image noise.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "standard_perspective_5", label: "Shutter", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template2 = new hou.StringParmTemplate({name: "sweep", label: "Sweep", num_components: 1, default_value: ["down"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["down", "right", "up", "left"], menu_labels: ["down", "right", "up", "left"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setHelp("Shutter direction. Specifies the direction that the shutter sweeps. The default, down, is the most common direction for rolling shutters.");
			hou_parm_template2.setTags({"script_ritype": "string"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "duration", label: "Duration", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Exposure duration. Zero means an ideal rolling shutter where each line is exposed instantaneously when read. The default, one, is equivalent to a global shutter where all lines are exposed and read at the same time.");
			hou_parm_template2.setTags({"script_ritype": "float"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrcamera',_hnt_VOP_pxrcamera)
    return _hnt_VOP_pxrcamera
}
        