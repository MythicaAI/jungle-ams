
export default function (hou) {
    class _hnt_SOP_shrinkwrap extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/shrinkwrap';
        static category = '/SOP';
        static houdiniType = 'shrinkwrap';
        static title = 'Shrinkwrap';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_shrinkwrap.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "dist", label: "Distance", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "cliptol", label: "Clip Tolerance", num_components: 1, default_value: [0.001], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Logarithmic, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "constol", label: "Consolidate Tolerance", num_components: 1, default_value: [0.001], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Logarithmic, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/shrinkwrap',_hnt_SOP_shrinkwrap)
    return _hnt_SOP_shrinkwrap
}
        