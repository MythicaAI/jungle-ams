
export default function (hou) {
    class _hnt_SOP_heightfield_project extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Environments/Terrain/heightfield_project';
        static category = '/SOP';
        static houdiniType = 'heightfield_project';
        static title = 'HeightField Project';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_heightfield_project.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP', 'SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "layer", label: "Layer", num_components: 1, default_value: ["height"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils \n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "maskmode", label: "Mask Mode", default_value: false});
			hou_parm_template.setTags({"export_disable": "1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "maskdir", label: "Masking by Geometry", menu_items: ["both", "above", "below"], menu_labels: ["Either Side", "Above Heightfield", "Below Heightfield"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskmode == 0 }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "heightlayer", label: "Height Layer", num_components: 1, default_value: ["height"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import terraintoolutils \n\nreturn terraintoolutils.buildNameMenu(kwargs['node'])", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskmode == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "maskdensity", label: "Density", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ maskmode == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskmode == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "maskinvert", label: "Invert", default_value: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ maskmode == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskmode == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "hitfarthest", label: "Hit Farthest", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ maskmode == 1 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "combine", label: "Combine Method", menu_items: ["replace", "add", "multiply", "max", "min"], menu_labels: ["Replace", "Add", "Multiply", "Maximum", "Minimum"], default_value: 3, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "maxraydist", label: "Max Ray Dist", num_components: 1, default_value: [1000], min: 0, max: 1000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setTags({"autoscope": "0000000000000000", "parmvop": "1", "shaderparmcontexts": "cvex"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dojitter", label: "Supersampling", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "sample", label: "Samples", num_components: 1, default_value: [3], min: 1, max: 25, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dojitter == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "jitter", label: "Jitter", num_components: 1, default_value: [0.25], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ sample == 1 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ dojitter == 0 }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "jittercombine", label: "Ray Combiner", menu_items: ["avg", "median", "min", "max"], menu_labels: ["Average", "Median", "Shortest", "Longest"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ sample == 1 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ dojitter == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "seed", label: "Seed", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ sample == 1 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ dojitter == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Environments/Terrain/heightfield_project',_hnt_SOP_heightfield_project)
    return _hnt_SOP_heightfield_project
}
        