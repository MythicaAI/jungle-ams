
export default function (hou) {
    class _hnt_SOP_vdbvectorsplit extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbvectorsplit';
        static category = '/SOP';
        static houdiniType = 'vdbvectorsplit';
        static title = 'VDB Vector Split';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbvectorsplit.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDBs to be split (see [specifying volumes|/model/volumes#group])\n\nVector-valued VDBs are split into component scalar VDBs; VDBs of other types are passed through unchanged.", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "remove_sources", label: "Remove Source VDBs", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "If enabled, delete vector grids that have been split."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "copyinactive", label: "Copy Inactive Values", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbvectorsplit',_hnt_SOP_vdbvectorsplit)
    return _hnt_SOP_vdbvectorsplit
}
        