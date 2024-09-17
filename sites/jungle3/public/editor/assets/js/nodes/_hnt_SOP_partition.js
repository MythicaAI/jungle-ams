
export default function (hou) {
    class _hnt_SOP_partition extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/partition';
        static category = '/SOP';
        static houdiniType = 'partition';
        static title = 'Partition';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_partition.svg';
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
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = kwargs['node'].parmTuple('entity')\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "entity", label: "Entity", menu_items: ["primitive", "point"], menu_labels: ["Primitives", "Points"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "geotype", label: "Geometry Type", menu_items: ["all", "bezierc", "bezier", "mesh", "Channel", "circle", "Hexahedron", "MetaSQuad", "meta", "nurbc", "nurb", "PackedAgent", "AlembicRef", "PackedDisk", "PackedDiskSequence", "PackedFragment", "PackedGeometry", "PackedUSD", "part", "poly", "polysoup", "sphere", "tetrahedron", "trifan", "tristrip", "tribez", "tube", "vdb", "volume"], menu_labels: ["All Types", "Bezier Curve", "Bezier Surface", "Bilinear Mesh", "Channel", "Circle", "Hexahedron", "Meta Super-quad", "Metaball", "NURBS Curve", "NURBS Surface", "Packed Agent", "Packed Alembic", "Packed Disk", "Packed Disk Sequence", "Packed Fragment", "Packed Geometry", "Packed USD", "Particle System", "Polygon", "Polygon Soup", "Sphere", "Tetrahedron", "Triangle Fan", "Triangle Strip", "Triangular Bezier Patch", "Tube", "VDB", "Volume"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "rule", label: "Rule", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["color_`rint(@Cd.r*255)`_`rint(@Cd.g*255)`_`rint(@Cd.b*255)`", "alpha_`rint(@Alpha*255)`"], menu_labels: ["Group by Color", "Group by Alpha"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/partition',_hnt_SOP_partition)
    return _hnt_SOP_partition
}
        