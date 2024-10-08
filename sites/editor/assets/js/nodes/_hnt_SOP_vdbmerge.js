
export default function (hou) {
    class _hnt_SOP_vdbmerge extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'SOP/Other/vdbmerge';
        static category = '/SOP';
        static houdiniType = 'vdbmerge';
        static title = 'VDB Merge';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbmerge.svg';
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
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDBs to be modified (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "collation", label: "Collation", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["name", "primitive_number", "all"], menu_labels: ["Name", "Primitive Number", "All"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"houdini_utils::doc": "The criteria under which groups of grids are merged. In addition to these collation options, only grids with the same class (fog volume, level set, etc) and value type (float, int, etc) are merged.\n\nName:\n   Collate VDBs with the same grid name.\n\nPrimitive Number:\n   Collate first primitives from each input, then second primitives from each input, etc.\n\nNone:\n   Collate all VDBs (provided they have the same class and value type).\n\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "resampleinterp", label: "Interpolation", menu_items: ["point", "linear", "quadratic"], menu_labels: ["Nearest", "Linear", "Quadratic"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The type of interpolation to be used when resampling one VDB to match the other's transform\n\nNearest neighbor interpolation is fast but can introduce noticeable sampling artifacts.  Quadratic interpolation is slow but high-quality. Linear interpolation is intermediate in speed and quality."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "Group1", label: "Merge Operation", folder_type: hou.folderType.Tabs, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "op_fog", label: "Fog VDBs", num_components: 1, default_value: ["add"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "add"], menu_labels: ["None            ", "Add"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"houdini_utils::doc": "Merge operation for Fog VDBs.\n\nNone:\n   Leaves input fog VDBs unchanged.\n\nAdd:\n   Generate the sum of all fog VDBs within the same collation.\n\n"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "op_sdf", label: "SDF VDBs", num_components: 1, default_value: ["sdfunion"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["none", "sdfunion", "sdfintersect"], menu_labels: ["None            ", "SDF Union", "SDF Intersect"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setTags({"houdini_utils::doc": "Merge operation for SDF VDBs.\n\nNone:\n    Leaves input SDF VDBs unchanged.\n\nSDF Union:\n    Generate the union of all signed distance fields within the same collation.\n\nSDF Intersection:\n    Generate the intersection of all signed distance fields within the same collation.\n\n"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbmerge',_hnt_SOP_vdbmerge)
    return _hnt_SOP_vdbmerge
}
        