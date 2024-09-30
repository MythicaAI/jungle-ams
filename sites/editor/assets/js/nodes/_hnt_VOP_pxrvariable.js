
export default function (hou) {
    class _hnt_VOP_pxrvariable extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrvariable';
        static category = '/VOP';
        static houdiniType = 'pxrvariable';
        static title = 'Pxr Variable';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrvariable.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "variable", label: "Variable", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["", "P", "Po", "Nn", "Ngn", "Non", "Tn", "Vn", "VLen", "curvature", "curvature_u", "curvature_v", "incidentRaySpread", "incidentRayRadius", "PRadius", "mpSize", "biasR", "biasT", "u", "v", "w", "uv", "uvw", "du", "dv", "dw", "duv", "uvw", "dPdu", "dPdv", "dPdw", "dPdtime", "time", "outsideIOR", "Oi", "motionFore", "motionBack"], menu_labels: ["Use Named PrimVar", "Shading position (P)", "Undisplaced position (Po)", "Shading normal (Nn)", "Geometric normal (Ngn)", "Undisplaced normal (Non)", "Shading tangent (Tn)", "Normalized view vector (Vn)", "Length of view vector (VLen)", "Surface mean curvature (curvature)", "Surface principal curvature in u dir (curvature_u)", "Surface principal curvature in v dir (curvature_v)", "Ray Spread (incidentRaySpread)", "Ray Radius (incidentRayRadius)", "Micropolygon radius (PRadius)", "Micropolygon size (mpSize)", "Reflection Bias (biasR)", "Transmission (biasT)", "Surface U (u)", "Surface V (v)", "Surface W (w)", "Surface UV (uv)", "Surface UVW (uvw)", "Ray footprint U (du)", "Ray footprint V (dv)", "Ray footprint W (dw)", "Ray footprint UV (duv)", "Ray footprint UVW (duvw)", "Surface derivative U (dPdu)", "Surface derivative V (dPdv)", "Surface derivative W (dPdw)", "Velocity (dPdtime)", "Time (time)", "Outside IOR (outsideIOR)", "Opacity (Oi)", "Forward Motion (motionFore)", "Backward Motion (motionBack)"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "name", label: "PrimVar", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "type", label: "Type", num_components: 1, default_value: ["float"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["float", "float2", "float3", "color", "point", "vector", "normal"], menu_labels: ["float", "float2", "float3", "color", "point", "vector", "normal"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "coordsys", label: "Coordinate System", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("By default, the shader uses current coordinate system. Possible coordinate systems include 'world', 'object', or an user defined coordinate system.");
			hou_parm_template.setTags({"script_ritype": "string"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrvariable',_hnt_VOP_pxrvariable)
    return _hnt_VOP_pxrvariable
}
        