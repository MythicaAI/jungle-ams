
export default function (hou) {
    class _hnt_COP2_labs__normal_map extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'COP2/Labs/Image/Vector/labs::normal_map';
        static category = '/COP2/labs';
        static houdiniType = 'labs::normal_map';
        static title = 'Labs Normal From Grayscale';
        static icon = '/editor/assets/imgs/nodes/_hnt_COP2_labs__normal_map.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['COP2'];
            const outputs = ['COP2'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FolderParmTemplate({name: "stdswitcher2", label: "Labels", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "multiplier", label: "Strength", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The intensity of the normal resulting normal map. ");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "strength", label: "_old_strength", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "blur_strength", label: "Blur Strength", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Additional blurring that can be used to fake beveling in the normal map");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "flip_x", label: "Flip X", default_value: false});
			hou_parm_template.setHelp("Invert the Red Channel");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "flip_y", label: "Flip Y", default_value: false});
			hou_parm_template.setHelp("Invert the Green Channel, useful in case your renderer is expecting a different type of normal map. ");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('COP2/Labs/Image/Vector/labs::normal_map',_hnt_COP2_labs__normal_map)
    return _hnt_COP2_labs__normal_map
}
        