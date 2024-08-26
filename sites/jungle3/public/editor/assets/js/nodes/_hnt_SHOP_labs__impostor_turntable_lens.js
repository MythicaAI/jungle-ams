
export default function (hou) {
    class _hnt_SHOP_labs__impostor_turntable_lens extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Labs/Rendering/Camera/labs::impostor_turntable_lens';
        static category = '/SHOP/labs';
        static houdiniType = 'labs::impostor_turntable_lens';
        static title = 'Labs Turntable Lens';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_labs__impostor_turntable_lens.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SHOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "fixed_z", label: "fixed_z", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "rows", label: "rows", num_components: 1, default_value: [2], min: 1, max: 16, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "columns", label: "columns", num_components: 1, default_value: [2], min: 1, max: 16, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "camera_width", label: "camera_width", num_components: 1, default_value: [1], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "camera_zoom", label: "camera_zoom", num_components: 1, default_value: [1.1], min: 0, max: 2, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Labs/Rendering/Camera/labs::impostor_turntable_lens',_hnt_SHOP_labs__impostor_turntable_lens)
    return _hnt_SHOP_labs__impostor_turntable_lens
}
        