
export default function (hou) {
    class _hnt_SOP_block_begin extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/block_begin';
        static category = '/SOP';
        static houdiniType = 'block_begin';
        static title = 'Block Begin';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_block_begin.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "method", label: "Method", menu_items: ["feedback", "piece", "metadata", "input"], menu_labels: ["Fetch Feedback", "Extract Piece or Point", "Fetch Metadata", "Fetch Input"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "blockpath", label: "Block Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "resetcookpass", label: "Reset Cached Pass"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "createmetablock", label: "Create Meta Import Node"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "label1", label: "Detail Attributes:", column_labels: ["iteration, numiterations, value, ivalue"]});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/block_begin',_hnt_SOP_block_begin)
    return _hnt_SOP_block_begin
}
        