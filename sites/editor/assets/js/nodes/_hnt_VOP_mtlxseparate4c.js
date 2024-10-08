
export default function (hou) {
    class _hnt_VOP_mtlxseparate4c extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Channel/mtlxseparate4c';
        static category = '/VOP';
        static houdiniType = 'mtlxseparate4c';
        static title = 'MtlX Separate Color 4';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_mtlxseparate4c.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "in", label: "Input", num_components: 4, default_value: [0, 0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Channel/mtlxseparate4c',_hnt_VOP_mtlxseparate4c)
    return _hnt_VOP_mtlxseparate4c
}
        