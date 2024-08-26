
export default function (hou) {
    class _hnt_VOP_pxrblackbody extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/pxrblackbody';
        static category = '/VOP';
        static houdiniType = 'pxrblackbody';
        static title = 'Pxr Black Body';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_pxrblackbody.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP', 'VOP', 'VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.FloatParmTemplate({name: "temperature", label: "Temperature", num_components: 1, default_value: [5500], min: 1000, max: 15000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("The temperature (in kelvin) of the black body. Color temperatures over 5,000K are called cool colors (bluish white), while lower color temperatures (2,700 to 3,000 K) are called warm colors (yellowish white through red).");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "physicalIntensity", label: "Physical Intensity", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("When set to 1, the color will emit the correct amount of energy. WARNING: Your color will become super intense.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "exposure", label: "Exposure", num_components: 1, default_value: [0], min: null, max: 25, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setHelp("Use exposure to adjust the amount of emited energy. Very useful if physical intensity is above zero.");
			hou_parm_template.setTags({"script_ritype": "float"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/pxrblackbody',_hnt_VOP_pxrblackbody)
    return _hnt_VOP_pxrblackbody
}
        