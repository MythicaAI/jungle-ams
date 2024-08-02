
export default function (hou) {
    class _hnt_VOP_pxrbackgrounddisplayfilter extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrbackgrounddisplayfilter';
        static category = '/VOP';
        static houdiniType = 'pxrbackgrounddisplayfilter';
        static title = 'Pxr Background Display Filter';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrbackgrounddisplayfilter.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "backgroundColor", label: "Background Color", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setHelp("Color of the background.");
			hou_parm_template.setTags({"script_ritype": "color"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrbackgrounddisplayfilter',_hnt_VOP_pxrbackgrounddisplayfilter)
    return _hnt_VOP_pxrbackgrounddisplayfilter
}
        