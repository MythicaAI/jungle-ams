
export default function (hou) {
    class _hnt_SOP_labs__inside_face_uvs extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Destruction/labs::inside_face_uvs';
        static category = '/SOP/labs';
        static houdiniType = 'labs::inside_face_uvs';
        static title = 'Labs Inside Face UVs';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__inside_face_uvs.svg';
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
			let hou_parm_template = new hou.FloatParmTemplate({name: "tiling", label: "Tiling", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Amount of uv space to use; 1 will use the 0-1 range, 2 will use 0-2 etc.");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "method", label: "UV Flattening Method", menu_items: ["scp", "abf"], menu_labels: ["Spectral (SCP)", "Angle-Based (ABF)"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setHelp("How to flatten 3d geometry into uv space, see the 'UV flatten' sop help for details.");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Destruction/labs::inside_face_uvs',_hnt_SOP_labs__inside_face_uvs)
    return _hnt_SOP_labs__inside_face_uvs
}
        