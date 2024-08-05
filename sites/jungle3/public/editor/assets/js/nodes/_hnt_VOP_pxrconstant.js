
export default function (hou) {
    class _hnt_VOP_pxrconstant extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrconstant';
        static category = '/VOP';
        static houdiniType = 'pxrconstant';
        static title = 'Pxr Constant';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrconstant.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "emitColor", label: "Emit Color", num_components: 3, default_value: [1, 1, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setTags({"ogl_emit": "1", "script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "presence", label: "Presence", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Connect a mask function here to apply a cutout pattern to your object. Presence is defined as a binary (0 or 1) function that can take on continuous values to antialias the shape. Useful for modeling leaves and other thin, complex shapes.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrconstant',_hnt_VOP_pxrconstant)
    return _hnt_VOP_pxrconstant
}
        