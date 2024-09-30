
export default function (hou) {
    class _hnt_SOP_pyropostprocess__2_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Dynamics/Pyro/pyropostprocess::2.0';
        static category = '/SOP';
        static houdiniType = 'pyropostprocess::2.0';
        static title = 'Pyro Post-Process';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_pyropostprocess__2_0.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "folder1_1", label: "Post Process", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_default": "1", "group_type": "collapsible"});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "computeminmax", label: "Compute Min/Max Values", default_value: true});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "conv_vdb", label: "Convert to VDB", default_value: false});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "conv_combine", label: "Combine Volumes", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ conv_vdb != 1 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "conv_usefp16", label: "Convert to 16bit Float", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "conv_docull", label: "Cull Volume", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ conv_vdb != 1 }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "conv_cullvolumenames", label: "Cull Volume", num_components: 1, default_value: ["vel"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\n\nr = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:        \n        attrib = geo.findPrimAttrib(\'name\')        \n        if attrib:        \n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)                \n                \n                if prim.intrinsicValue(\'typename\') == \'Volume\':\n                    if (\'.\' not in vol):\n                        r.extend([vol, vol])\n                        continue\n                    if (\'.\' in vol): \n                        vol = vol.split(\".\")[0]\n                        if vol not in r:\n                            r.extend([vol, vol])\n                        continue\n                \n                if \'VDB\' in prim.intrinsicValue(\'typename\'):                    \n                    if \'fog volume\' in prim.intrinsicValue(\'vdb_class\'):\n                        if (prim.intrinsicValue(\'vdb_value_type\') == \'float\'):\n                            r.extend([vol, vol])  \n                            continue\n                        if (prim.intrinsicValue(\'vdb_value_type\') == \'vec3s\'):\n                            r.extend([vol, vol]) \n                            continue\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ conv_vdb != 1 } { conv_docull != 1 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "conv_doscale", label: "Resample Volumes", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "conv_scalevolumenames", label: "Resample Volumes", num_components: 1, default_value: ["vel"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\n\nrank = 1\n\nr = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:        \n        attrib = geo.findPrimAttrib(\'name\')        \n        if attrib:        \n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)                \n                \n                if prim.intrinsicValue(\'typename\') == \'Volume\':\n                    if (rank == 0 and \'.\' not in vol):\n                        r.extend([vol, vol])\n                        continue\n                    if (rank == 1 and \'.\' in vol): \n                        vol = vol.split(\".\")[0]\n                        if vol not in r:\n                            r.extend([vol, vol])\n                        continue\n                \n                if \'VDB\' in prim.intrinsicValue(\'typename\'):                    \n                    if \'fog volume\' in prim.intrinsicValue(\'vdb_class\'):\n                        if (rank == 0 and prim.intrinsicValue(\'vdb_value_type\') == \'float\'):\n                            r.extend([vol, vol])  \n                            continue\n                        if (rank == 1 and prim.intrinsicValue(\'vdb_value_type\') == \'vec3s\'):\n                            r.extend([vol, vol]) \n                            continue\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ conv_doscale == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "conv_scale", label: "Voxel Size Scale", num_components: 1, default_value: [2], min: 1, max: 4, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ conv_doscale == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "doflamedensity", label: "Ensure Density for Flame", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "flamedensity", label: "Flame Density", num_components: 1, default_value: [0.0001], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ doflamedensity == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder0", label: "Bindings", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "collapsible"});
			hou_parm_template2 = new hou.StringParmTemplate({name: "conv_vectorvdb", label: "Vector VDBs", num_components: 1, default_value: ["vel"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\n\nrank = 1\n\nr = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:        \n        attrib = geo.findPrimAttrib(\'name\')        \n        if attrib:        \n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)                \n                \n                if prim.intrinsicValue(\'typename\') == \'Volume\':\n                    if (rank == 0 and \'.\' not in vol):\n                        r.extend([vol, vol])\n                        continue\n                    if (rank == 1 and \'.\' in vol): \n                        vol = vol.split(\".\")[0]\n                        if vol not in r:\n                            r.extend([vol, vol])\n                        continue\n                \n                if \'VDB\' in prim.intrinsicValue(\'typename\'):                    \n                    if \'fog volume\' in prim.intrinsicValue(\'vdb_class\'):\n                        if (rank == 0 and prim.intrinsicValue(\'vdb_value_type\') == \'float\'):\n                            r.extend([vol, vol])  \n                            continue\n                        if (rank == 1 and prim.intrinsicValue(\'vdb_value_type\') == \'vec3s\'):\n                            r.extend([vol, vol]) \n                            continue\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ conv_vdb == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "conv_cullmaskvolumename", label: "Cull Mask Volume", num_components: 1, default_value: ["density"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\n\nrank = 0\n\nr = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:        \n        attrib = geo.findPrimAttrib(\'name\')        \n        if attrib:        \n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)                \n                \n                if prim.intrinsicValue(\'typename\') == \'Volume\':\n                    if (rank == 0 and \'.\' not in vol):\n                        r.extend([vol, vol])\n                        continue\n                    if (rank == 1 and \'.\' in vol): \n                        vol = vol.split(\".\")[0]\n                        if vol not in r:\n                            r.extend([vol, vol])\n                        continue\n                \n                if \'VDB\' in prim.intrinsicValue(\'typename\'):                    \n                    if \'fog volume\' in prim.intrinsicValue(\'vdb_class\'):\n                        if (rank == 0 and prim.intrinsicValue(\'vdb_value_type\') == \'float\'):\n                            r.extend([vol, vol])  \n                            continue\n                        if (rank == 1 and prim.intrinsicValue(\'vdb_value_type\') == \'vec3s\'):\n                            r.extend([vol, vol]) \n                            continue\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ conv_docull != 1 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "bind_density", label: "Density Volume", num_components: 1, default_value: ["density"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\n\nrank = 0\n\nr = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:        \n        attrib = geo.findPrimAttrib(\'name\')        \n        if attrib:        \n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)                \n                \n                if prim.intrinsicValue(\'typename\') == \'Volume\':\n                    if (rank == 0 and \'.\' not in vol):\n                        r.extend([vol, vol])\n                        continue\n                    if (rank == 1 and \'.\' in vol): \n                        vol = vol.split(\".\")[0]\n                        if vol not in r:\n                            r.extend([vol, vol])\n                        continue\n                \n                if \'VDB\' in prim.intrinsicValue(\'typename\'):                    \n                    if \'fog volume\' in prim.intrinsicValue(\'vdb_class\'):\n                        if (rank == 0 and prim.intrinsicValue(\'vdb_value_type\') == \'float\'):\n                            r.extend([vol, vol])  \n                            continue\n                        if (rank == 1 and prim.intrinsicValue(\'vdb_value_type\') == \'vec3s\'):\n                            r.extend([vol, vol]) \n                            continue\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ doflamedensity == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "bind_flame", label: "Flame Volume", num_components: 1, default_value: ["flame"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "node = kwargs[\'node\']\nindex = kwargs[\'script_multiparm_index\']\n\nrank = 0\n\nr = []\nnode = hou.pwd()\ninputs = node.inputs()\nif inputs and inputs[0]:\n    geo = inputs[0].geometry()\n    if geo:        \n        attrib = geo.findPrimAttrib(\'name\')        \n        if attrib:        \n            for prim in geo.prims():\n                vol = prim.stringAttribValue(attrib)                \n                \n                if prim.intrinsicValue(\'typename\') == \'Volume\':\n                    if (rank == 0 and \'.\' not in vol):\n                        r.extend([vol, vol])\n                        continue\n                    if (rank == 1 and \'.\' in vol): \n                        vol = vol.split(\".\")[0]\n                        if vol not in r:\n                            r.extend([vol, vol])\n                        continue\n                \n                if \'VDB\' in prim.intrinsicValue(\'typename\'):                    \n                    if \'fog volume\' in prim.intrinsicValue(\'vdb_class\'):\n                        if (rank == 0 and prim.intrinsicValue(\'vdb_value_type\') == \'float\'):\n                            r.extend([vol, vol])  \n                            continue\n                        if (rank == 1 and prim.intrinsicValue(\'vdb_value_type\') == \'vec3s\'):\n                            r.extend([vol, vol]) \n                            continue\nreturn r", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ doflamedensity == 0 }");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Dynamics/Pyro/pyropostprocess::2.0',_hnt_SOP_pyropostprocess__2_0)
    return _hnt_SOP_pyropostprocess__2_0
}
        