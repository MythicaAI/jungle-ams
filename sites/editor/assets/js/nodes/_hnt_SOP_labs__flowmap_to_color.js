
export default function (hou) {
    class _hnt_SOP_labs__flowmap_to_color extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/FX/Fluid/labs::flowmap_to_color';
        static category = '/SOP/labs';
        static houdiniType = 'labs::flowmap_to_color';
        static title = 'Labs Flowmap to Color';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__flowmap_to_color.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "node_vis_enabled", label: "Visualization Enabled", default_value: true});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "num_visualizers", label: "Visualizers", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.hide(true);
			hou_parm_template.setTags({"multistartoffset": "0"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "vis_active#", label: "Active #", default_value: false});
			hou_parm_template2.hide(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "vis_data#", label: "Raw Data #", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.hide(true);
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setTags({"editor": "1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "flip_g", label: "Flip Green Channel (Unity)", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/FX/Fluid/labs::flowmap_to_color',_hnt_SOP_labs__flowmap_to_color)
    return _hnt_SOP_labs__flowmap_to_color
}
        