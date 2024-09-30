
export default function (hou) {
    class _hnt_VOP_pxraovlight extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxraovlight';
        static category = '/VOP';
        static houdiniType = 'pxraovlight';
        static title = 'Pxr AOV Light';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxraovlight.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "aovName", label: "AOV Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("The name of the AOV to write to.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "refine", label: "Refine", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "useColor", label: "Use Color", default_value: false});
			hou_parm_template2.setHelp("If this is on, it outputs a RGB color image instead of a float image for the AOV.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "invert", label: "Invert", default_value: false});
			hou_parm_template2.setHelp("If this is on, it inverts the signal for the AOV.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "inPrimaryHit", label: "In Primvary Hit", default_value: true});
			hou_parm_template2.setHelp("If this is on, the usual mask of the illuminated objects is generated. If this is off, you can get a mask of only in the refraction or reflection.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "inRefraction", label: "In Refraction", default_value: false});
			hou_parm_template2.setHelp("If this is on, the rays are traced through the glass refractions to get the masking signal. Warning: this will require some amount of samples to get a clean mask.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "inReflection", label: "In Reflection", default_value: false});
			hou_parm_template2.setHelp("If this is on, the rays are traced through the specular reflections to get the masking signal. Warning: this will require some amount of samples to get a clean mask.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "onVolumeBoundaries", label: "On Volume Boundaries", default_value: true});
			hou_parm_template2.setHelp("If this is on, the bounding box or shape of volumes will appear in the mask. Since this is not always desirable, this can be turned off.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "useThroughput", label: "Use Throughput", default_value: true});
			hou_parm_template2.setHelp("If this is on, the values in the mask for the reflected or refracted rays will be affected by the strength of the reflection or refraction. This can lead to values below and above 1.0. Turn this off if you want a more solid mask.");
			hou_parm_template2.setTags({"script_ritype": "int"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxraovlight',_hnt_VOP_pxraovlight)
    return _hnt_VOP_pxraovlight
}
        