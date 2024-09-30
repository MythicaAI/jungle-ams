
export default function (hou) {
    class _hnt_VOP_mtlxtime extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Application/mtlxtime';
        static category = '/VOP';
        static houdiniType = 'mtlxtime';
        static title = 'MtlX Time';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_mtlxtime.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "fps", label: "Fps", num_components: 1, default_value: [24], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Application/mtlxtime',_hnt_VOP_mtlxtime)
    return _hnt_VOP_mtlxtime
}
        