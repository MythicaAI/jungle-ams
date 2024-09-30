
export default function (hou) {
    class _hnt_VOP_pxrdisplace extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrdisplace';
        static category = '/VOP';
        static houdiniType = 'pxrdisplace';
        static title = 'Pxr Displace (new, RIS)';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrdisplace.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "enabled", label: "Enabled", default_value: true});
			hou_parm_template.setHelp("Enable the displacement. When this is turned off, there will be no displacement.");
			hou_parm_template.setTags({"script_ritype": "int"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispAmount", label: "Gain", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Specify the displacement gain amount. When the amount is 0.0, there will be no displacement. This is a multiplier.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispScalar", label: "Scalar Displacement", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Displacement value that is float or scalar. This could be connected to a float pattern which could be procedural or texture.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "dispVector", label: "Vector Displacement", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("Displacement value that is vector. This could be connected to a vector pattern which could be procedural or texture.");
			hou_parm_template.setTags({"script_ritype": "vector"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "modelDispVector", label: "Model Displacement", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setHelp("Model Displacement is the displacement for the model such as from the extracted displacement versus the displacement from the shading network. This could be connected to a vector pattern which could be procedural or texture. This adds to the regular Vector Displacement");
			hou_parm_template.setTags({"script_ritype": "vector"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrdisplace',_hnt_VOP_pxrdisplace)
    return _hnt_VOP_pxrdisplace
}
        