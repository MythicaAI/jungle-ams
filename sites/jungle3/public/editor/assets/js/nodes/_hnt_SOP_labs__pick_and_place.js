
export default function (hou) {
    class _hnt_SOP_labs__pick_and_place extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/World Building/Placement/labs::pick_and_place';
        static category = '/SOP/labs';
        static houdiniType = 'labs::pick_and_place';
        static title = 'Labs Pick and Place';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__pick_and_place.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.IntParmTemplate({name: "iCurID", label: "Current ID", num_components: 1, default_value: [0], min: 0, max: 10000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.hide(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "iPlacements", label: "Placements", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.IntParmTemplate({name: "iID_#", label: "ID", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_transforms_#", label: "Transforms", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			let hou_parm_template3 = new hou.FloatParmTemplate({name: "vHitNormal_#", label: "Hitnormal", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.hide(true);
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "bAlignToSurface_#", label: "Align to Surface", default_value: true});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "vPosition_#", label: "Position", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "vScale_#", label: "Scale", num_components: 3, default_value: [1, 1, 1], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "vRotate_#", label: "Rotation", num_components: 3, default_value: [0, 0, 0], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/World Building/Placement/labs::pick_and_place',_hnt_SOP_labs__pick_and_place)
    return _hnt_SOP_labs__pick_and_place
}
        