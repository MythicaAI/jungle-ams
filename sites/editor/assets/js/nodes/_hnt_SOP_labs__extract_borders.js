
export default function (hou) {
    class _hnt_SOP_labs__extract_borders extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/Mesh: Convert/labs::extract_borders';
        static category = '/SOP/labs';
        static houdiniType = 'labs::extract_borders';
        static title = 'Labs Extract Borders';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__extract_borders.svg';
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
			let hou_parm_template = new hou.ToggleParmTemplate({name: "as_curves", label: "As Curves", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "uv_borders", label: "UV Borders", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "split_vertices", label: "Split All Points", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ uv_borders == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/Mesh: Convert/labs::extract_borders',_hnt_SOP_labs__extract_borders)
    return _hnt_SOP_labs__extract_borders
}
        