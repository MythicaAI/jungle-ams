
export default function (hou) {
    class _hnt_VOP_fresnel extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/fresnel';
        static category = '/VOP';
        static houdiniType = 'fresnel';
        static title = 'Fresnel';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_fresnel.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "eta", label: "Index Of Refraction", num_components: 1, default_value: [0.8], min: 0.1, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/fresnel',_hnt_VOP_fresnel)
    return _hnt_VOP_fresnel
}
        