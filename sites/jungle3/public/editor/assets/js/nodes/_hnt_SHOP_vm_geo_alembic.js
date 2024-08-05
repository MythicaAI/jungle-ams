
export default function (hou) {
    class _hnt_SHOP_vm_geo_alembic extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SHOP/Other/vm_geo_alembic';
        static category = '/SHOP';
        static houdiniType = 'vm_geo_alembic';
        static title = 'Alembic';
        static icon = '/editor/assets/imgs/nodes/_hnt_SHOP_vm_geo_alembic.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SHOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "useobjectgeometry", label: "Use Object Geometry", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "filename", label: "Alembic File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useobjectgeometry == 1 }");
			hou_parm_template.setTags({"filechooser_mode": "read", "filechooser_pattern": "*.abc"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "frame", label: "Frame", num_components: 1, default_value: [0], default_expression: ["$FF"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useobjectgeometry == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "fps", label: "FPS", num_components: 1, default_value: [0], default_expression: ["$FPS"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useobjectgeometry == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "objectpath", label: "Object Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "__import__('_alembic_hom_extensions').alembicGetObjectPathListForMenu(hou.pwd().evalParm('filename'))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useobjectgeometry == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "objectpattern", label: "Object Pattern", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useobjectgeometry == 1 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "nonalembic", label: "Render Non-Alembic Primitives", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ useobjectgeometry == 0 }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "userpropertymap", label: "User Properties", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["{ \"subd\" : \"rendersubd\", \"dbound\" : \"displacebound\" }", "reflectlimit subd:rendersubd dbound:displacebound"], menu_labels: ["Sample JSON format", "Sample String Format"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setHelp("Apply Alembic user properties to mantra rendering properties");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "attribfile", label: "Attribute File", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template.setHelp("Use this file to secondary attributes for Alembic geometry");
			hou_parm_template.setTags({"filechooser_mode": "read", "filechooser_pattern": "*.abc"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "pointattribs", label: "Point Attributes", num_components: 1, default_value: ["*,^P,^N,^v"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ attribfile == \\\"\\\" }");
			hou_parm_template.setHelp("Comma separated list of varying/point attribute names to import from the attribfile");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "vertexattribs", label: "Vertex Attributes", num_components: 1, default_value: ["*,^P,^N,^v"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ attribfile == \\\"\\\" }");
			hou_parm_template.setHelp("Comma separated list of facevarying/vertex attribute names to import from the attribfile");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "uniformattribs", label: "Primitive Attributes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ attribfile == \\\"\\\" }");
			hou_parm_template.setHelp("Comma separated list of uniform/primitive attribute names to import from the attribfile");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "detailattribs", label: "Detail Attributes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ attribfile == \\\"\\\" }");
			hou_parm_template.setHelp("Comma separated list of constant/detail attribute names to import from the attribfile");
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SHOP/Other/vm_geo_alembic',_hnt_SHOP_vm_geo_alembic)
    return _hnt_SHOP_vm_geo_alembic
}
        