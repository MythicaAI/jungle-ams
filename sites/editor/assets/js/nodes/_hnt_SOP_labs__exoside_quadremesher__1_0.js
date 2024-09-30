
export default function (hou) {
    class _hnt_SOP_labs__exoside_quadremesher__1_0 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/Integration/labs::exoside_quadremesher::1.0';
        static category = '/SOP/labs';
        static houdiniType = 'labs::exoside_quadremesher::1.0';
        static title = 'Labs Exoside QuadRemesher';
        static icon = 'None';
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
			let hou_parm_template = new hou.ButtonParmTemplate({name: "CookNow", label: "Cook Now"});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ bAutoCook == 1 }");
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template.setScriptCallback("kwargs[\'node\'].hdaModule().buttonCookNow(kwargs[\'node\'].node(\"python1\"))");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "kwargs[\'node\'].hdaModule().buttonCookNow(kwargs[\'node\'].node(\"python1\"))", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "bAutoCook", label: "Auto Cook", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template.setHelp("Auto Cook");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "TargetQuadCount", label: "Target Quad Count", num_components: 1, default_value: [5000], min: 200, max: 10000, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Logarithmic, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"export_disable": "1", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_quadssizing", label: "Quads Sizing", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.FloatParmTemplate({name: "AdaptiveSize", label: "Adaptive Size", num_components: 1, default_value: [50], min: 0, max: 100, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setHelp("Allows to control how quad's size locally adapts to curvatures.\\nThe higher it is, the smaller the quads will be on high curvature areas.\\nSet it at 0, to get uniform quads size");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "AdaptiveQuadCount", label: "Adaptive Quad Count", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setHelp("Adaptive Quad-Count :\\nOn: Creates more polygons than asked to fit high curvatures area. \\nOff: Tries to respect the Target-Quad-Count more exactly");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "UseVertexColors", label: "Use Vertex Colors", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ DensityAttribName != \\\"\\\" }");
			hou_parm_template2.setHelp("Use 'Vertex Colors' to control the Quads size density.\\nSee 'Paint SOP' help below...");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "PaintedQuadDensity", label: "Painted Quad Density", num_components: 1, default_value: [1], min: 0.25, max: 4, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Logarithmic, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ UseVertexColors == 0 }");
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template2.setHelp("Defines the Color to paint to control locally the desired Quad Density variations (using 'Paint SOP') \\n . from 0.25 => 'divide density by 4'  =  Big Quads  =  Cyan color \\n . to 4  => 'multiply density by 4'  =  Small Quads  =  Red color.");
			hou_parm_template2.setScriptCallback("hou.pwd().hm().onPaint(kwargs, hou.pwd()) ");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.pwd().hm().onPaint(kwargs, hou.pwd()) ", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "SetColor", label: "Setup 'Painting' SOP"});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ UseVertexColors == 0 }");
			hou_parm_template2.setHelp("Set the parent 'Paint' or 'Attribute Paint' SOP color corresponding with the 'Painted Quad Density' Value\\nand make this painting SOP active..\\nThis button is usefull only if the input/parent node of the QuadRemesher node is a Paint SOP.");
			hou_parm_template2.setScriptCallback("kwargs['node'].hdaModule().buttonSetPaintingColor()");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"export_disable": "1", "script_callback": "kwargs['node'].hdaModule().buttonSetPaintingColor()", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "DensityAttribName", label: "Use Density Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ UseVertexColors == 1 }");
			hou_parm_template2.hide(true);
			hou_parm_template2.setHelp("If not empty, QuadRemesher will use the specified Point Attribute (float in [0,1]) to drive the remeshing.\\n 0 means 4 times bigger quads, 0.5 means unchanged quads and 1 means 4 times smaller quads");
			hou_parm_template2.setTags({"script_callback": ""});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_edgeloopscontrol", label: "Edge Loops Control", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "UseMaterialGroups", label: "Use Material Boundaries", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setHelp("If On, QuadRemesher will use 'MaterialGroups' to drive the quad remeshing.\\n    MaterialGroups will be maintained after remeshing.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "DetectHardEdges", label: "Detect Hard-Edges by angle", default_value: true, default_expression: "on", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setHelp("Let QuadRemesher detect automatically HardEdges. If 'Use Hard Edges' is checked, it's better to uncheck 'Detect Hard Edges'");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "UseNormalsSplitting", label: "Use Normals Splitting", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setHelp("If On, QuadRemesher will use the existing 'Normals' to guide the remeshing on edge loops where the normals are creased.\\nAs most operations automatically set the Normals, it's advised to enable it.\\nOn smooth organic shapes, it's advised to disable it.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "UsePrimitiveGroups", label: "Use Primitive Groups Boundaries", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ PrimitiveAttribName != \\\"\\\" }");
			hou_parm_template2.setHelp("If On, QuadRemesher will use the existing 'Primitive Groups' boundaries to guide the remeshing.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "PrimitiveAttribName", label: "Use Primitive Attribute", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ UsePrimitiveGroups == 1 }");
			hou_parm_template2.setHelp("If not empty, QuadRemesher will use the specified Primitive Attribute (integer) boundaries to drive the remeshing.");
			hou_parm_template2.setTags({"script_callback": ""});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "UseEdgeGroups", label: "Use Edge Groups", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.hide(true);
			hou_parm_template2.setHelp("If On, QuadRemesher will use the existing 'Primitive Groups' boundaries to guide the remeshing.");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_misc", label: "Misc", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_symmetryaxis", label: "Symmetry Axis", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "simple"});
			let hou_parm_template3 = new hou.ToggleParmTemplate({name: "SymX", label: "X", default_value: false});
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "SymY", label: "Y", default_value: false});
			hou_parm_template3.setJoinWithNext(true);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "SymZ", label: "Z", default_value: false});
			hou_parm_template3.setHelp("These options allows to perform symmetrical quad remeshing. It's possible to combine all 3 symmetry axis.");
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_advanced", label: "Advanced", folder_type: hou.folderType.Collapsible, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setTags({"group_type": "collapsible"});
			hou_parm_template3 = new hou.StringParmTemplate({name: "out_cache", label: "Cache File", num_components: 1, default_value: ["${HIP}/render/${HIPNAME}_${OS}_QR_output.fbx"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "LicenseMgr", label: "License Manager"});
			hou_parm_template2.setScriptCallback("kwargs['node'].hdaModule().buttonLicMgr(kwargs['node'])");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "kwargs['node'].hdaModule().buttonLicMgr(kwargs['node'])", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/Integration/labs::exoside_quadremesher::1.0',_hnt_SOP_labs__exoside_quadremesher__1_0)
    return _hnt_SOP_labs__exoside_quadremesher__1_0
}
        