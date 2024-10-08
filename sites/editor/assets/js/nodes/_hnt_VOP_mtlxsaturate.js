
export default function (hou) {
    class _hnt_VOP_mtlxsaturate extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/MaterialX/Color Correction/mtlxsaturate';
        static category = '/VOP';
        static houdiniType = 'mtlxsaturate';
        static title = 'MtlX Saturate';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_mtlxsaturate.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP', 'VOP', 'VOP'];
            const outputs = ['VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "signature", label: "Signature", num_components: 1, default_value: ["default"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"sidefx::shader_isparm": "0"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "in", label: "Input", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "in_color4", label: "Input", num_components: 4, default_value: [0, 0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setTags({"sidefx::shader_parmname": "in"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "amount", label: "Amount", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "lumacoeffs", label: "Lumacoeffs", num_components: 3, default_value: [0.272229, 0.674082, 0.0536895], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "lumacoeffsmenu", label: "Lumacoeffs", num_components: 1, default_value: ["acescg"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["acescg", "rec709", "rec2020", "rec2100"], menu_labels: ["acescg", "rec709", "rec2020", "rec2100"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setScriptCallback("n = kwargs['parm_name'].replace('menu','')\np = kwargs['node'].parmTuple(n)\nd = {'acescg': (0.2722287, 0.6740818, 0.0536895), 'rec709': (0.2126, 0.7152, 0.0722), 'rec2020': (0.2627, 0.678, 0.0593), 'rec2100': (0.2627, 0.678, 0.0593)}\nv = d.get( kwargs['script_value'], None )\nif p and v is not None:\n    p.set(v)\n");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "n = kwargs['parm_name'].replace('menu','')\np = kwargs['node'].parmTuple(n)\nd = {'acescg': (0.2722287, 0.6740818, 0.0536895), 'rec709': (0.2126, 0.7152, 0.0722), 'rec2020': (0.2627, 0.678, 0.0593), 'rec2100': (0.2627, 0.678, 0.0593)}\nv = d.get( kwargs['script_value'], None )\nif p and v is not None:\n    p.set(v)\n", "script_callback_language": "python", "sidefx::shader_isparm": "0"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/MaterialX/Color Correction/mtlxsaturate',_hnt_VOP_mtlxsaturate)
    return _hnt_VOP_mtlxsaturate
}
        