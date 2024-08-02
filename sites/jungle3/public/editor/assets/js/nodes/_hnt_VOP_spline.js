
export default function (hou) {
    class _hnt_VOP_spline extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'VOP/Other/spline';
        static category = '/VOP';
        static houdiniType = 'spline';
        static title = 'Spline';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_spline.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "spline", label: "Spline", num_components: 1, default_value: ["catmull-rom"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["catmull-rom", "linear", "linearsolve", "bezier", "bspline", "hermite", "solvecatrom"], menu_labels: ["Catmull-Rom", "Linear", "VEX: Solve Linear", "RSL: Bezier", "RSL: B-Spline", "RSL: Hermite", "RSL: Solve Catmull-Rom"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "u", label: "Parametric Coordinate", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/spline',_hnt_VOP_spline)
    return _hnt_VOP_spline
}
        