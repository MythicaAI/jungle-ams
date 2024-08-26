
export default function (hou) {
    class _hnt_LOP_insertionpoint extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/insertionpoint';
        static category = '/LOP';
        static houdiniType = 'insertionpoint';
        static title = 'Insertion Point';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_insertionpoint.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "descriptor", label: "Name", num_components: 1, default_value: ["`opnodigits($OS)`"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import hou\nimport insertionpointutils as util\nmenu = util.createExistingNamesMenu()\nreturn menu", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/insertionpoint',_hnt_LOP_insertionpoint)
    return _hnt_LOP_insertionpoint
}
        