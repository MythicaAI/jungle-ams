
export default function (hou) {
    class _hnt_VOP_mtlxblackbody extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Pbr/mtlxblackbody';
        static category = '/VOP';
        static houdiniType = 'mtlxblackbody';
        static title = 'MtlX Blackbody';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_mtlxblackbody.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "temperature", label: "Temperature", num_components: 1, default_value: [5000], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Pbr/mtlxblackbody',_hnt_VOP_mtlxblackbody)
    return _hnt_VOP_mtlxblackbody
}
        