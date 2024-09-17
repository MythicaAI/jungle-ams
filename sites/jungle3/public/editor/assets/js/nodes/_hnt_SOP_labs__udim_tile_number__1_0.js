
export default function (hou) {
    class _hnt_SOP_labs__udim_tile_number__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Geometry/UV: Visualize/labs::udim_tile_number::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::udim_tile_number::1.0';
        static title = 'Labs UDIM Tile Number';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__udim_tile_number__1_0.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "uvattrib", label: "UV Attribute", num_components: 1, default_value: ["uv"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "r = []\nnode = hou.pwd()\ninputs = node.inputs()\n\nif inputs and inputs[0]:\n\n    geo = inputs[0].geometry()\n    \n    if geo:\n        \n        if geo.findPointAttrib(node.parm(\"uvattrib\").evalAsString()):\n            attrs = geo.pointAttribs()\n            \n        else:\n            attrs = geo.vertexAttribs()\n            \n        for a in attrs:\n            if a.dataType() == hou.attribData.Float and not a.isArrayType() and a.size() == 3:\n                r.extend([a.name(), a.name()])\n                \nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "udimattrib", label: "UDIM Tile Attribute", num_components: 1, default_value: ["udim_tile"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "udimattribclass", label: "UDIM Tile Attribute Class", menu_items: ["0", "1", "2"], menu_labels: ["Primitive", "Point", "Vertex"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "visualize", label: "Visualize UDIM Tile Numbers", default_value: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Geometry/UV: Visualize/labs::udim_tile_number::1.0',_hnt_SOP_labs__udim_tile_number__1_0)
    return _hnt_SOP_labs__udim_tile_number__1_0
}
        