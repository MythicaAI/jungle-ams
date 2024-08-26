
export default function (hou) {
    class _hnt_SOP_vdbvectormerge extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbvectormerge';
        static category = '/SOP';
        static houdiniType = 'vdbvectormerge';
        static title = 'VDB Vector from Scalar';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbvectormerge.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "xgroup", label: "X Group", num_components: 1, default_value: ["@name=*.x"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "ygroup", label: "Y Group", num_components: 1, default_value: ["@name=*.y"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "zgroup", label: "Z Group", num_components: 1, default_value: ["@name=*.z"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usexname", label: "Use Basename of X VDB", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "Use the base name of the __X Group__ as the name for the output VDB. For example, if __X Group__ is `Cd.x`, the generated vector VDB will be named `Cd`.\n\nIf this option is disabled or if the __X__ primitive has no `name` attribute, the output VDB will be given the __Merged VDB Name__."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "merge_name", label: "Merged VDB Name", num_components: 1, default_value: ["merged#"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "vectype", label: "Vector Type", menu_items: ["invariant", "covariant", "covariant normalize", "contravariant relative", "contravariant absolute"], menu_labels: ["Tuple/Color/UVW", "Gradient/Normal", "Unit Normal", "Displacement/Velocity/Acceleration", "Position"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Specify how the output VDB\'s vector values should be affected by transforms:\n\nTuple / Color / UVW:\n    No transformation\n\nGradient / Normal:\n    Inverse-transpose transformation, ignoring translation\n\nUnit Normal:\n    Inverse-transpose transformation, ignoring translation,\n    followed by renormalization\n\nDisplacement / Velocity / Acceleration:\n    \"Regular\" transformation, ignoring translation\n\nPosition:\n    \"Regular\" transformation with translation\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "remove_sources", label: "Remove Source VDBs", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "copyinactive", label: "Copy Inactive Values", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbvectormerge',_hnt_SOP_vdbvectormerge)
    return _hnt_SOP_vdbvectormerge
}
        