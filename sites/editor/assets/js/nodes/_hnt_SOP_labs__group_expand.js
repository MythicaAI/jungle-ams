
export default function (hou) {
    class _hnt_SOP_labs__group_expand extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Group/labs::group_expand';
        static category = '/SOP/labs';
        static houdiniType = 'labs::group_expand';
        static title = 'Labs Group Expand';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__group_expand.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "def build_menu_from_group(groups, menu):\n    if len(groups):\n        menu.extend((\"-\", \"\"))\n        \n    for group in groups:\n        name = group.name()\n        menu.extend((name, name))\n    \n    return menu\n    \nsopnode = hou.pwd()\n# List of tokens/labels to return.\nmenu = []\n# Make sure there is an input node before asking for its geometry.\nif sopnode.inputs():\n    # Optionally add in \'*\' for all groups.\n    menu.extend((\"*\", \"*\"))\n    geo = sopnode.inputs()[0].geometry()\n    \n    menu = build_menu_from_group(geo.pointGroups(), menu)\n    menu = build_menu_from_group(geo.edgeGroups(), menu)\n    menu = build_menu_from_group(geo.primGroups(), menu)\n        \nreturn menu", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "iterations", label: "Iterations", num_components: 1, default_value: [1], min: null, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Group/labs::group_expand',_hnt_SOP_labs__group_expand)
    return _hnt_SOP_labs__group_expand
}
        