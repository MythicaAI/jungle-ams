
export default function (hou) {
    class _hnt_SOP_labs__flowmap extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Simulation & FX/Fluid/labs::flowmap';
        static category = '/SOP/labs';
        static houdiniType = 'labs::flowmap';
        static title = 'Labs Flowmap';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__flowmap.svg';
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
			let hou_parm_template = new hou.ToggleParmTemplate({name: "use_normal_as_v", label: "Use Normal as Velocity", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "initial_direction", label: "Initial Direction", num_components: 3, default_value: [0, 1, 0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ use_normal_as_v != 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "visualize_flow", label: "Visualize Flow", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Simulation & FX/Fluid/labs::flowmap',_hnt_SOP_labs__flowmap)
    return _hnt_SOP_labs__flowmap
}
        