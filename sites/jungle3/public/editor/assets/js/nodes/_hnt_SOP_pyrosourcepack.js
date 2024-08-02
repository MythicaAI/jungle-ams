
export default function (hou) {
    class _hnt_SOP_pyrosourcepack extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/Pyro/pyrosourcepack';
        static category = '/SOP';
        static houdiniType = 'pyrosourcepack';
        static title = 'Pyro Source Pack';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_pyrosourcepack.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "inputtype", label: "Input", menu_items: ["volumes", "rbdpieces"], menu_labels: ["Volumes to Source", "Rigid Body Pieces"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "name", label: "Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != volumes }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "group", label: "Group", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "hou.pwd().generateInputGroupMenu(0, hou.geometryType.Primitives)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "referenceframe", label: "Reference Frame", num_components: 1, default_value: [1], min: 1, max: 240, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "framerange", label: "Frame Range", num_components: 2, default_value: [1, 12], min: null, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != volumes }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "convertvdb", label: "Convert to VDB", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != volumes }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "voxelsize", label: "Voxel Size", num_components: 1, default_value: [0.1], min: 0, max: 5, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != rbdpieces }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "distancename", label: "Collision SDF", num_components: 1, default_value: ["collision"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != rbdpieces }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "bandwidth", label: "Voxel Bandwidth", num_components: 1, default_value: [3], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != rbdpieces }");
			hou_parm_template.setTags({"autoscope": "0000000000000000", "houdini_utils::doc": ""});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "fillinterior", label: "Fill Interior", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != rbdpieces }");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "numsources", label: "Number of Sources", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ doinstance == 0 } { setrules == 0 }");
			hou_parm_template.setConditional(hou.parmCondType.HideWhen, "{ inputtype != volumes }");
			hou_parm_template.setTags({"autoscope": "0000000000000000"});
			let hou_parm_template2 = new hou.FolderParmTemplate({name: "folder17_#", label: "Volume #", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_default": "1", "group_type": "collapsible", "sidefx::header_label": "source_localheader#", "sidefx::header_toggle": "source_activate#"});
			let hou_parm_template3 = new hou.LabelParmTemplate({name: "source_localheader#", label: "Label", column_labels: ["Source `substr($CH, 18, 5)`:    `chs(\"source_vfield\" + substr($CH, 18, 5))`"]});
			hou_parm_template3.hideLabel(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "source_activate#", label: "Activation", default_value: true});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "source_voperator#", label: "Operation", menu_items: ["copy", "add", "sub", "mul", "div", "max", "min", "average", "guide", "blend", "none"], menu_labels: ["Copy", "Add", "Subtract", "Multiply", "Divide", "Maximum", "Minimum", "Average", "Pull", "Blend", "None"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "source_rank#", label: "Source  Rank", menu_items: ["scalar", "vector"], menu_labels: ["Scalar", "Vector"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "source_addinstvel#", label: "Add Instance Velocities", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_rank# != vector }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "source_volume#", label: "Source Volume", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\nrank = node.parm(\"source_rank{}\".format(index)).evalAsInt()\n\nr = []\n\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:\n        attrib = geo.findPrimAttrib(\'name\')\n        if attrib:\n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)\n                \n                if prim.intrinsicValue(\'typename\') == \'Volume\':\n                    if (rank == 0 and \'.\' not in vol):\n                        r.extend([vol, vol])\n                        continue\n                    if (rank == 1 and \'.\' in vol):\n                        vol = vol.split(\".\")[0]\n                        if vol not in r:\n                            r.extend([vol, vol])\n                        continue\n                \n                if \'VDB\' in prim.intrinsicValue(\'typename\'):\n                    if (rank == 0 and prim.intrinsicValue(\'vdb_value_type\') == \'float\') or (rank == 1 and prim.intrinsicValue(\'vdb_value_type\') == \'vec3s\'):\n                        r.extend([vol, vol])\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "source_vfield#", label: "Target Field", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\nrank = node.parm(\"source_rank{}\".format(index)).evalAsInt()\n\nr = []\n\nif (rank == 0):\n    r.extend([\'density\', \'density\']) \n    r.extend([\'temperature\', \'temperature\'])\n    r.extend([\'flame\', \'flame\']) \n    r.extend([\'divergence\', \'divergence\'])  \n    r.extend([\'Alpha\', \'Alpha\'])\nelse:\n    r.extend([\'vel\', \'vel\']) \n    r.extend([\'Cd\', \'Cd\']) \n\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "source_weightvolume#", label: "Source Weight", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "r = []\n\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:\n        attrib = geo.findPrimAttrib('name')\n        if attrib:\n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)\n                \n                if prim.intrinsicValue('typename') == 'Volume':\n                    r.extend([vol, vol])\n                if 'VDB' in prim.intrinsicValue('typename') and prim.intrinsicValue('vdb_value_type') == 'float':\n                    r.extend([vol, vol])\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_voperator# != blend }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "source_vweightfield#", label: "Target Weight", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["density", "temperature", "flame", "divergence", "Alpha"], menu_labels: ["density", "temperature", "flame", "divergence", "Alpha"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_voperator# != blend }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "source_vscale#", label: "Source Scale", num_components: 1, default_value: [1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "source_vnormalize#", label: "Use Timestep", default_value: true});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 } { source_voperator# == copy } { source_voperator# == min } { source_voperator# == max }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm5_#"});
			hou_parm_template3.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "source_accguidestr#", label: "Acceleration Strength", num_components: 1, default_value: [1], min: 0, max: 2, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_voperator# != guide }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "source_decguidestr#", label: "Deceleration Strength", num_components: 1, default_value: [1], min: 0, max: 2, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_voperator# != guide }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "source_enabledirblend#", label: "Direction Strength", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_voperator# != guide } { source_rank# == scalar }");
			hou_parm_template3.hideLabel(true);
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "source_dirguidestr#", label: "Direction Strength", num_components: 1, default_value: [1], min: 0, max: 2, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 } { source_enabledirblend# == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_voperator# != guide } { source_rank# == scalar }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "source_usenorm#", label: "Use Vector Length", default_value: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_rank# != vector } { source_voperator# != min source_voperator# != max }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "source_nonneg#", label: "Avoid Negatives", default_value: true});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ source_activate# != 1 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ source_voperator# != sub }");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/Pyro/pyrosourcepack',_hnt_SOP_pyrosourcepack)
    return _hnt_SOP_pyrosourcepack
}
        