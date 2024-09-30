
export default function (hou) {
    class _hnt_SOP_connectadjacentpieces extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/RBD/connectadjacentpieces';
        static category = '/SOP';
        static houdiniType = 'connectadjacentpieces';
        static title = 'Connect Adjacent Pieces';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_connectadjacentpieces.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "connecttype", label: "Connection Type", menu_items: ["points", "pieces", "pointcloud"], menu_labels: ["Adjacent Pieces from Points", "Adjacent Pieces from Surface Points", "Adjacent Points"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "pieceattrib", label: "Piece Attribute", num_components: 1, default_value: ["name"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a remove_all_attrib primdel", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connecttype == pointcloud }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "useclusterattrib", label: "Find Boundary Connections", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connecttype == pointcloud }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "clusterattrib", label: "Cluster Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "opmenu -l -a remove_all_attrib primdel", item_generator_script_language: hou.scriptLanguage.Hscript, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connecttype == pointcloud } { useclusterattrib == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud } { useclusterattrib == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "nptsperarea", label: "Points per Area", num_components: 1, default_value: [100], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype != pieces }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "relaxpoints", label: "Relax Points", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype != pieces }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "relaxiterations", label: "Relax Iterations", num_components: 1, default_value: [1], min: 0, max: 100, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ relaxpoints == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype != pieces }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "uniformradius", label: "Assume Uniform Radius", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype != pointcloud }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "searchradius", label: "Search Radius", num_components: 1, default_value: [0.1], min: 0, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "maxsearchpoints", label: "Max Search Points", num_components: 1, default_value: [100], min: 0, max: 1000, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "useconeangle", label: "Use Cone Angle", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connecttype == pointcloud }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "coneangle", label: "Cone Angle", num_components: 1, default_value: [90], min: 0, max: 180, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useconeangle == 0 } { connecttype == pointcloud }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usemindist", label: "Use Minimum Distance", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connecttype == pointcloud }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "mindist", label: "Minimum Distance", num_components: 1, default_value: [0.05], min: 0, max: 180, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ usemindist == 0 } { connecttype == pointcloud }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "maxconnections", label: "Max Connections", num_components: 1, default_value: [1], min: 1, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype == pointcloud }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "centroidmethod", label: "Centroid Method", menu_items: ["com", "bbox"], menu_labels: ["Center of Mass", "Bounding Box Center"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connecttype != pieces }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype != pieces }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "distancefromcentroid", label: "Offset From Centroid", num_components: 1, default_value: [0], min: 0, max: 1, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connecttype != pieces }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ connecttype != pieces }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "createlengthattrib", label: "Create Length Attribute", default_value: false});
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "lengthattrib", label: "Length Attribute", num_components: 1, default_value: ["restlength"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ createlengthattrib == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/RBD/connectadjacentpieces',_hnt_SOP_connectadjacentpieces)
    return _hnt_SOP_connectadjacentpieces
}
        