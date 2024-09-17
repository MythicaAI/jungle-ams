
export default function (hou) {
    class _hnt_SOP_pyrosourceinstance extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/Pyro/pyrosourceinstance';
        static category = '/SOP';
        static houdiniType = 'pyrosourceinstance';
        static title = 'Pyro Source Instance';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_pyrosourceinstance.svg';
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
			let hou_parm_template = new hou.IntParmTemplate({name: "referenceframe", label: "Reference Frame", num_components: 1, default_value: [1], min: 1, max: 240, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "visualize", label: "Visualize Sources", default_value: false});
			hou_parm_template.setScriptCallback("hou.node('.').setOutputForViewFlag(-1 if hou.node('.').evalParm('visualize') else 0)");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.node('.').setOutputForViewFlag(-1 if hou.node('.').evalParm('visualize') else 0)", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "noverrides", label: "Overrides", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			let hou_parm_template2 = new hou.StringParmTemplate({name: "target#", label: "Target Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["density", "temperature", "flame", "vel", "divergence", "Cd", "Alpha"], menu_labels: ["density", "temperature", "flame", "vel", "divergence", "Cd", "Alpha"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "property#", label: "Property", num_components: 1, default_value: ["source_activate"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["source_activate", "source_vscale", "source_accguidestr", "source_decguidestr", "source_dirguidestr"], menu_labels: ["Activation", "Scale", "Acceleration Strength", "Deceleration Strength", "Direction Strength"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "modattr#", label: "Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "SKIP_ATTRIBUTES = [ \"startframe\", \"endframe\", \"startoffset\", \"sourcespeed\", \"looplength\" ]\nr = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:\n        attrs = geo.pointAttribs()\n        for a in attrs:\n            if a.dataType() == hou.attribData.Float and not a.isArrayType() and a.size() == 1 and a.name() not in SKIP_ATTRIBUTES:\n                r.extend([a.name(), a.name()])\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_action": "import soptoolutils\n\nnode = kwargs[\'node\']\nindex = str(kwargs[\'script_multiparm_index\'])\nname = node.evalParm(\'modattr\' + index)\nadjust = soptoolutils.buildAttribAdjustFromActionButton(kwargs, \'attribadjustfloat\',\n    { \'parms\' : { \'attrib\'      :       name,\n                  \'operation\'   :       1,\n                  \'valuetype\'   :       1,\n                  \'dodefault\'   :       1,\n                  \'default\'     :       1 }\n    })\n\nname = \'chs(\"../\'\nname += node.name()\nname += \'/modattr\' + index\nname += \'\")\'\nadjust.parm(\'attrib\').setExpression(name)\n\nprop = node.evalParm(\'property\' + index)\nif prop == \'source_activate\':\n    adjust.parm(\'rangemethod\').set(\'specific\')\n    adjust.parm(\'valuetype0\').set(\'list\')\n    adjust.parm(\'values0\').set(\'0 1\')\n", "script_action_help": "Create an adjustment node to randomize the attribute's values.", "script_action_icon": "BUTTONS_randomize", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/Pyro/pyrosourceinstance',_hnt_SOP_pyrosourceinstance)
    return _hnt_SOP_pyrosourceinstance
}
        