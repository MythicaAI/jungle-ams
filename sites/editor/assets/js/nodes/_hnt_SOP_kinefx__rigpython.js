
export default function (hou) {
    class _hnt_SOP_kinefx__rigpython extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Animation/Rigging/kinefx::rigpython';
        static category = '/SOP/kinefx';
        static houdiniType = 'kinefx::rigpython';
        static title = 'Rig Python';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_kinefx__rigpython.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP', 'SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "viewerstate", label: "Viewer State", num_components: 1, default_value: ["kinefx__rigpython"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setHelp("None");
			hou_parm_template.setTags({"spare_category": "Viewer States"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "computetransforms", label: "Compute Transforms", default_value: true});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "python", label: "Python Code", num_components: 1, default_value: ["from kinefx import rigapi\npwd = hou.pwd()\nnode = pwd.parent()\nctx = rigapi.RigContext(pwd.geometry(),pwd) \nr = ctx.rig # Rig to write to, Copy of input0 if connected\n#r0 = ctx.inputRig(0) # Input0 readonly rigapi.GeoSkeleton\n#r1 = ctx.inputRig(1) # Input1 readonly rigapi.GeoSkeleton\n#r2 = ctx.inputRig(2) # Input2 readonly rigapi.GeoSkeleton\n#r3 = ctx.inputRig(3) # Input3 readonly rigapi.GeoSkeleton"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a python1 python", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "editor": "1", "editorlang": "python", "editorlines": "20-50"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Animation/Rigging/kinefx::rigpython',_hnt_SOP_kinefx__rigpython)
    return _hnt_SOP_kinefx__rigpython
}
        