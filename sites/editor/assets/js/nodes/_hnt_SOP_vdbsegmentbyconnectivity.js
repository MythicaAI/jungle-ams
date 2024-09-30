
export default function (hou) {
    class _hnt_SOP_vdbsegmentbyconnectivity extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbsegmentbyconnectivity';
        static category = '/SOP';
        static houdiniType = 'vdbsegmentbyconnectivity';
        static title = 'VDB Segment by Connectivity';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbsegmentbyconnectivity.svg';
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
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDB grids to be segmented (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "colorsegments", label: "Color Segments", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "If enabled, assign a unique, random color to each segment for ease of identification."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "appendnumber", label: "Append Segment Number to Grid Name", default_value: true});
			hou_parm_template.setTags({"houdini_utils::doc": "If enabled, name each output VDB after the input VDB with a unique segment number appended for ease of identification."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbsegmentbyconnectivity',_hnt_SOP_vdbsegmentbyconnectivity)
    return _hnt_SOP_vdbsegmentbyconnectivity
}
        