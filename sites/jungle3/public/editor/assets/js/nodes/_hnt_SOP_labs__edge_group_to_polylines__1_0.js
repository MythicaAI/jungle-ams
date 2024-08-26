
export default function (hou) {
    class _hnt_SOP_labs__edge_group_to_polylines__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Mesh: Convert/labs::edge_group_to_polylines::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::edge_group_to_polylines::1.0';
        static title = 'Labs Edge Group to Polylines';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__edge_group_to_polylines__1_0.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "edgegroup", label: "Edge Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "kwargs['node'].generateInputGroupMenu(0, group_types=hou.geometryType.Edges)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = hou.geometryType.Edges\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_icon": "BUTTONS_reselect", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Mesh: Convert/labs::edge_group_to_polylines::1.0',_hnt_SOP_labs__edge_group_to_polylines__1_0)
    return _hnt_SOP_labs__edge_group_to_polylines__1_0
}
        