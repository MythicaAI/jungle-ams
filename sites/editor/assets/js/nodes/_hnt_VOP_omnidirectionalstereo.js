
export default function (hou) {
    class _hnt_VOP_omnidirectionalstereo extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/omnidirectionalstereo';
        static category = '/VOP';
        static houdiniType = 'omnidirectionalstereo';
        static title = 'Pxr Omini Directional Stereo';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_omnidirectionalstereo.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "interpupilaryDistance", label: "Interpupilary Distance", num_components: 1, default_value: [0.0635], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The distance between the two eyes. The default, 0.0635, should work if your scene is measured in meters.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/omnidirectionalstereo',_hnt_VOP_omnidirectionalstereo)
    return _hnt_VOP_omnidirectionalstereo
}
        