
export default function (hou) {
    class _hnt_VOP_pxrwhitepointdisplayfilter extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrwhitepointdisplayfilter';
        static category = '/VOP';
        static houdiniType = 'pxrwhitepointdisplayfilter';
        static title = 'Pxr White Point Display Filter';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrwhitepointdisplayfilter.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "temperature", label: "Temperature", num_components: 1, default_value: [6500], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Allow the user to choose the color temperature of the light. Unlike the basic light color this allows the user to easily pick plausible light colors based on standard temperature measurements.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "useManualWhitePoint", label: "Manual White Point?", default_value: false});
			hou_parm_template.setHelp("This switch enables using the White Point below rather than rely on color temperature for white balance.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "manualWhitePoint", label: "White Point", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Adjust the image so that this color becomes the white value.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "aov", label: "AOV", num_components: 1, default_value: ["Ci"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("Name of AOV to apply filter to.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrwhitepointdisplayfilter',_hnt_VOP_pxrwhitepointdisplayfilter)
    return _hnt_VOP_pxrwhitepointdisplayfilter
}
        