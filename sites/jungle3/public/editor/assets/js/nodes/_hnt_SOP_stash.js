
export default function (hou) {
    class _hnt_SOP_stash extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/stash';
        static category = '/SOP';
        static houdiniType = 'stash';
        static title = 'Stash';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_stash.svg';
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
			let hou_parm_template = new hou.DataParmTemplate({name: "stash", label: "Geometry Stash", num_components: 1, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "stashinput", label: "Stash Input"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "stashfile", label: "Geometry File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"filechooser_mode": "read_and_write"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "movestashtofile", label: "Move Stash to New File"});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ stash == \\\"\\\" }");
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "loadstashfromfile", label: "Load Stash from File"});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ stash != \\\"\\\" } { stashfile == \\\"\\\" } { stashfile =~ \\\"Error: .*\\\" }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/stash',_hnt_SOP_stash)
    return _hnt_SOP_stash
}
        