
export default function (hou) {
    class _hnt_VOP_lens_coordinates extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/lens_coordinates';
        static category = '/VOP';
        static houdiniType = 'lens_coordinates';
        static title = 'Lens Coordinates';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_lens_coordinates.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/lens_coordinates',_hnt_VOP_lens_coordinates)
    return _hnt_VOP_lens_coordinates
}
        