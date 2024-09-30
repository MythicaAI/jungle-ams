
export default function (hou) {
    class _hnt_VOP_usdtransform2d extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/usdtransform2d';
        static category = '/VOP';
        static houdiniType = 'usdtransform2d';
        static title = 'USD Transform 2D';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_usdtransform2d.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "in", label: "Input", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Input value to transform.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "translation", label: "Translation", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Translation to be applied to all components of the data.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float2"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "rotation", label: "Rotation", num_components: 1, default_value: [0], min: 0, max: 360, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Counter-clockwise rotation in degrees around the origin to be applied to all components of the data.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "scale", label: "Scale", num_components: 2, default_value: [1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Scale around the origin to be applied to all components of the data.");
			hou_parm_template.setTags({"sidefx::shader_parmtype": "float2"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/usdtransform2d',_hnt_VOP_usdtransform2d)
    return _hnt_VOP_usdtransform2d
}
        