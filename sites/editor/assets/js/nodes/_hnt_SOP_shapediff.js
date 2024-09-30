
export default function (hou) {
    class _hnt_SOP_shapediff extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/shapediff';
        static category = '/SOP';
        static houdiniType = 'shapediff';
        static title = 'Shape Difference';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_shapediff.svg';
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
			let hou_parm_template = new hou.MenuParmTemplate({name: "difftype", label: "Difference Method", menu_items: ["predeform", "postdeform", "postdeform_orient", "frominputgeo"], menu_labels: ["Pre-Deform", "Post-Deform", "Post-Deform Orient", "From Input Geometry"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "orientattrib", label: "Orient Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ difftype != postdeform_orient }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "skelrootpath", label: "Skeleton Root Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ difftype == postdeform } { difftype == postdeform_orient }");
			hou_parm_template.setTags({"opfilter": "!!OBJ!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "bonetransformpath", label: "Transforms Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ difftype == postdeform } { difftype == postdeform_orient }");
			hou_parm_template.setTags({"opfilter": "!!CHOP!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "skintype", label: "Skinning Method", menu_items: ["linear", "dualquat", "blenddualquat", "frominputgeo"], menu_labels: ["Linear", "Dual Quaternion", "Blend Dual Quaternion and Linear", "From Input Geometry"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ difftype == postdeform } { difftype == postdeform_orient }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "blendattrib", label: "Dual Quaternion Blend Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ skintype != blenddualquat } { difftype == postdeform } { difftype == postdeform_orient }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "donormal", label: "Deform Normals", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "dovattribs", label: "Deform Vector Attributes", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "vattribs", label: "Vector Attributes", num_components: 1, default_value: ["P"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "names = set()\nfor input in hou.pwd().inputs():\n    if input is not None and input.geometry() is not None:\n        geo = input.geometry()\n        attribs = geo.pointAttribs()\n        names.update([a.name() for a in attribs if a.dataType() == hou.attribData.Float and a.size() == 3])\nreturn [x for pair in [(n, n) for n in sorted(names)] for x in pair]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ dovattribs == 0 }");
			hou_parm_template.setTags({"sidefx::attrib_access": "readwrite"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "doqattribs", label: "Deform Quaternion Attributes", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "qattribs", label: "Quaternion Attributes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "names = set()\nfor input in hou.pwd().inputs():\n    if input is not None and input.geometry() is not None:\n        geo = input.geometry()\n        attribs = geo.pointAttribs()\n        names.update([a.name() for a in attribs if a.dataType() == hou.attribData.Float and a.size() == 4])\nreturn [x for pair in [(n, n) for n in sorted(names)] for x in pair]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ doqattribs == 0 }");
			hou_parm_template.setTags({"sidefx::attrib_access": "readwrite"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "maskattrib", label: "Mask Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "names = set()\nif len(hou.pwd().inputConnections()) == 3:\n    input = hou.pwd().inputs()[1]\n    geo = input.geometry(1)\n    if geo is not None:\n        attribs = geo.pointAttribs()\n        names.update([a.name() for a in attribs if a.dataType() == hou.attribData.Float])\nreturn [x for pair in [(n, n) for n in sorted(names)] for x in pair]", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setTags({"sidefx::attrib_access": "readwrite"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "scalemask", label: "Mask Scale", num_components: 1, default_value: [1], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ maskattrib == '' }");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/shapediff',_hnt_SOP_shapediff)
    return _hnt_SOP_shapediff
}
        