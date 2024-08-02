
export default function (hou) {
    class _hnt_SOP_vdbfracture extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/vdbfracture';
        static category = '/SOP';
        static houdiniType = 'vdbfracture';
        static title = 'VDB Fracture';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_vdbfracture.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"houdini_utils::doc": "A subset of the input VDBs to fracture (see [specifying volumes|/model/volumes#group])", "script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect", "sop_input": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "separatecutters", label: "Separate Cutters by Connectivity", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "cutteroverlap", label: "Allow Cutter Overlap", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "centercutter", label: "Center Cutter Geometry", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "randomizerotation", label: "Randomize Cutter Rotation", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "seed", label: "Random Seed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "segmentfragments", label: "Split Input Fragments into Primitives", default_value: false});
			hou_parm_template.setTags({"houdini_utils::doc": "Split input VDBs with disjoint fragments into multiple primitives, one per fragment.\n\nIf you have a tube and cut out the middle, the two ends might end up in the\nsame VDB.  This option will detect that and split the ends into two VDBs.\n\nNOTE:\n    This operation only needs to be performed if you plan on using the\n    output fragments for collision detection. If you use multiple fracture\n    nodes, then it is most efficient to only enable it on the very last\n    fracture node.\n"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "fragmentgroup", label: "Fragment Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "visualizepieces", label: "Visualization", menu_items: ["none", "all", "new"], menu_labels: ["None", "Pieces", "New Fragments"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setTags({"houdini_utils::doc": "The generated VDBs can be colored uniquely for ease of identification. The New Fragments option will leave the original pieces with their original coloring and assign colors only to newly-created pieces."});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/vdbfracture',_hnt_SOP_vdbfracture)
    return _hnt_SOP_vdbfracture
}
        