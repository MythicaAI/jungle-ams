
export default function (hou) {
    class _hnt_VOP_pxrrollingshutter extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrrollingshutter';
        static category = '/VOP';
        static houdiniType = 'pxrrollingshutter';
        static title = 'Pxr Rolling Shutter';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrrollingshutter.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "angle", label: "Angle", num_components: 1, default_value: [180], min: 0, max: 360, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Shutter angle to alter the time samples to achieve special shutter effects while leaving the ray positions alone.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrrollingshutter',_hnt_VOP_pxrrollingshutter)
    return _hnt_VOP_pxrrollingshutter
}
        