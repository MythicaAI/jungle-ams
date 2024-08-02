
export default function (hou) {
    class _hnt_SOP_heightfield_isolatelayer extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Environments/Terrain/heightfield_isolatelayer';
        static category = '/SOP';
        static houdiniType = 'heightfield_isolatelayer';
        static title = 'HeightField Isolate Layer';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_heightfield_isolatelayer.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "layer", label: "Layer to Isolate", num_components: 1, default_value: ["mask"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils \n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "overwriteheight", label: "Overwrite Height", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "overwritemask", label: "Overwrite Mask", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Environments/Terrain/heightfield_isolatelayer',_hnt_SOP_heightfield_isolatelayer)
    return _hnt_SOP_heightfield_isolatelayer
}
        