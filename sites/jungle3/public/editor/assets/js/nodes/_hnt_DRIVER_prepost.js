
export default function (hou) {
    class _hnt_DRIVER_prepost extends hou._HoudiniBase {
        static is_root = false;
        static id = 'DRIVER/Other/prepost';
        static category = '/DRIVER';
        static houdiniType = 'prepost';
        static title = 'PrePost';
        static icon = '/editor/assets/imgs/nodes/_hnt_DRIVER_prepost.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['DRIVER', 'DRIVER', 'DRIVER'];
            const outputs = ['DRIVER'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ButtonParmTemplate({name: "execute", label: "Render"});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "renderdialog", label: "Controls..."});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setTags({"takecontrol": "always"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "enablepre", label: "Run pre render operation", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "prerange", label: "Pre Frame Range", menu_items: ["usepre", "usefirst", "uselast", "usefull"], menu_labels: ["Pre render ROP's specified range", "Main job's first frame", "Main job's last frame", "Main job's rendered frame range"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "enablepost", label: "Run post render operation", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "postrange", label: "Post Frame Range", menu_items: ["usepost", "usefirst", "uselast", "usefull"], menu_labels: ["Post render ROP's specified range", "Main job's first frame", "Main job's last frame", "Main job's rendered frame range"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('DRIVER/Other/prepost',_hnt_DRIVER_prepost)
    return _hnt_DRIVER_prepost
}
        