
export default function (hou) {
    class _hnt_SOP_agentunpack extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/agentunpack';
        static category = '/SOP';
        static houdiniType = 'agentunpack';
        static title = 'Agent Unpack';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_agentunpack.svg';
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
			let hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"script_action": "import soputils\nkwargs['geometrytype'] = (hou.geometryType.Primitives,)\nkwargs['inputindex'] = 0\nsoputils.selectGroupParm(kwargs)", "script_action_help": "Select geometry from an available viewport.\nShift-click to turn on Select Groups.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "grouptype", label: "Group Type", menu_items: ["guess", "points", "prims"], menu_labels: ["Guess from Group", "Points", "Primitives"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "output", label: "Output", menu_items: ["deformed", "rest", "joints", "skeleton", "motionclips"], menu_labels: ["Deformed Geometry", "Rest Geometry", "Joints", "Skeleton", "MotionClips"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "uniqueagentdefinitions", label: "Limit to Unique Agent Definitions", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != rest }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "applyagentxform", label: "Apply Agent Transform", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output == motionclips }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output == motionclips }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "applyjointxforms", label: "Apply Joint Transforms", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output == deformed } { output == motionclips } { output == rest unpackrestshapesfrom == shapelib }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output == deformed } { output == motionclips }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "unpackrestshapesfrom", label: "Unpack Shapes From", menu_items: ["currentlayers", "collisionlayers", "alllayers", "shapelib"], menu_labels: ["Current Layers", "Collision Layers", "All Layers", "Shape Library"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != rest }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "layerfilter", label: "Layers", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildLayerMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { output == rest unpackrestshapesfrom == shapelib }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "shapefilter", label: "Shapes", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildShapeMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "limititerations", label: "Limit Iterations", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "iterations", label: "Iterations", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { limititerations == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addshapedeformerattrib", label: "Add Shape Deformer Attribute", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { output == rest unpackrestshapesfrom == shapelib }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "shapedeformerattrib", label: "Shape Deformer Attribute", num_components: 1, default_value: ["agentshapedeformer"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { output == rest unpackrestshapesfrom == shapelib } { addshapedeformerattrib == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addxformnameattrib", label: "Add Transform Name Attribute", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { output == rest unpackrestshapesfrom == shapelib }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "xformnameattrib", label: "Transform Name Attribute", num_components: 1, default_value: ["agenttransformname"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { output == rest unpackrestshapesfrom == shapelib } { addxformnameattrib == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "addlayernameattrib", label: "Add Layer Name Attribute", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { output == rest unpackrestshapesfrom == shapelib }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template.hideLabel(true);
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "layernameattrib", label: "Layer Name Attribute", num_components: 1, default_value: ["agentlayername"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != deformed output != rest } { output == rest unpackrestshapesfrom == shapelib } { addlayernameattrib == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != deformed output != rest }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "clipnames", label: "Clip Names", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildClipMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != motionclips }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != motionclips }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "transferattributes", label: "Transfer Attributes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "transfergroups", label: "Transfer Groups", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "numjointfilters", label: "Filters", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != joints }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != joints }");
			let hou_parm_template2 = new hou.StringParmTemplate({name: "jointnames#", label: "Joints", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import crowdstoolutils\nreturn crowdstoolutils.buildTransformMenu(hou.pwd())", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setTags({"script_action": "import crowdstoolutils\ncrowdstoolutils.selectJoint(kwargs['node'], kwargs['parmtuple'], exclusive=False)\n", "script_action_help": "Select a joint name from a tree view.", "script_action_icon": "BUTTONS_reselect"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "percentage#", label: "Percent of Agents", num_components: 1, default_value: [100], min: 0, max: 100, min_is_strict: true, max_is_strict: true, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "seed#", label: "Seed", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "skeletoncolor", label: "Skeleton Color", num_components: 3, default_value: [0, 0.09, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ output != skeleton output != motionclips }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ output != skeleton output != motionclips }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/agentunpack',_hnt_SOP_agentunpack)
    return _hnt_SOP_agentunpack
}
        