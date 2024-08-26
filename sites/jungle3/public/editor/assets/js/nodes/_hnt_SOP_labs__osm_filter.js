
export default function (hou) {
    class _hnt_SOP_labs__osm_filter extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Integration/labs::osm_filter';
        static category = '/SOP/labs';
        static houdiniType = 'labs::osm_filter';
        static title = 'Labs OSM Filter';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__osm_filter.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "fd_buildings", label: "Buildings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "buildings", label: "Buildings", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "building_parts", label: "Building Parts", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ buildings != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_roads", label: "Roads", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "roads", label: "Roads", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "motorway_roads", label: "Motorway", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "primary_roads", label: "Primary", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "secondary_roads", label: "Secondary", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "tertiary_roads", label: "Tertiary", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "residential_roads", label: "Residential", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "footway_roads", label: "Footway", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pedestrian_roads", label: "Pedestrian", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "other_roads", label: "Other", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ roads != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "other_data", label: "Other Data", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Integration/labs::osm_filter',_hnt_SOP_labs__osm_filter)
    return _hnt_SOP_labs__osm_filter
}
        