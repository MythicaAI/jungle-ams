
export default function (hou) {
    class _hnt_SOP_apex__invokegraph extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'SOP/Other/apex::invokegraph';
        static category = '/SOP/apex';
        static houdiniType = 'apex::invokegraph';
        static title = 'APEX Invoke Graph';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_apex__invokegraph.svg';
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
			let hou_parm_template = new hou.FolderParmTemplate({name: "inputbindings", label: "Input Bindings", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "binddictattrib#", label: "Bind Parms Dictionary", default_value: true});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "dictattrib#", label: "Dictionary To Bind", num_components: 1, default_value: ["parms"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "from apex import apexsoputils as asu\nindex = kwargs['script_multiparm_index']\nreturn asu.getDictAttribNames(hou.pwd().inputGeometry(index))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ binddictattrib# != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bindasgeoinput#", label: "Bind As Geometry Input", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "apexgeoparm#", label: "Bind To Geometry Parameter", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "from apex import apexsoputils as asu\nreturn asu.getGeoParms(hou.pwd().inputGeometry(0))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bindasgeoinput# != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bindnamedprims#", label: "Bind Named Primitives as Inputs", default_value: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "applytransforms#", label: "Apply Transforms", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bindnamedprims# != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "spacer#"});
			hou_parm_template2.setTags({"sidefx::layout_height": "medium", "sidefx::look": "blank"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "outputbindings", label: "Output Bindings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "dictbindings", label: "Output Dictionary Bindings", folder_type: hou.folderType.MultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template3 = new hou.StringParmTemplate({name: "apexoutputgroup#", label: "Apex Outputs Group", num_components: 1, default_value: ["output"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "from apex import apexsoputils as asu\nreturn asu.getBindings(hou.pwd().inputGeometry(0))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.StringParmTemplate({name: "outputattrib#", label: "Output Attrib", num_components: 1, default_value: ["parms"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.SeparatorParmTemplate({name: "sepparm1"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "bindoutputgeo", label: "Do Bind Output Geometry", default_value: false});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "apexgeooutput", label: "Bind Output Geometry", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "from apex import apexsoputils as asu\nreturn asu.getGeoOutputs(hou.pwd().inputGeometry(0))", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ bindoutputgeo != 1 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "outputmode", label: "Geometry Output Type", menu_items: ["output", "debug"], menu_labels: ["APEX Output", "Debug Graph"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "debugevaluation", label: "Debug Evaluation", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ outputmode != debug }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "forcereloadgraph", label: "Force Reload Graph", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "partialeval", label: "Enable Partial Evaluation", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "errorhandlingmode", label: "Error Handling", menu_items: ["ignore", "warn", "abort"], menu_labels: ["Ignore", "Report as Warnings", "Abort"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/apex::invokegraph',_hnt_SOP_apex__invokegraph)
    return _hnt_SOP_apex__invokegraph
}
        