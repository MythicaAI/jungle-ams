
export default function (hou) {
    class _hnt_SOP_dopimport__2_0 extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/dopimport::2.0';
        static category = '/SOP';
        static houdiniType = 'dopimport::2.0';
        static title = 'DOP Import';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_dopimport__2_0.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = [];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "doppath", label: "DOP Network", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.NodeReference, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.setTags({"opfilter": "!!DOP!!", "oprelative": "."});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "objpattern", label: "Objects", num_components: 1, default_value: ["*"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import doppoptoolutils\ndopnet = hou.node(hou.chsop(\"doppath\"))\nreturn doppoptoolutils.buildDopObjectMenu(dopnet) if dopnet else []", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "relpattern", label: "Relationships", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "import doppoptoolutils\ndopnet = hou.node(hou.chsop(\"doppath\"))\nreturn doppoptoolutils.buildDopRelationshipMenu(dopnet) if dopnet else []", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "donotsim", label: "Do Not Trigger Simulation", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder_geometry", label: "Geometry", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.MenuParmTemplate({name: "importstyle", label: "Import Style", menu_items: ["fetch", "points"], menu_labels: ["Fetch Geometry from DOP Network", "Create Points to Represent Objects"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.LabelParmTemplate({name: "spacer", label: "Spacer", column_labels: [""]});
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "pointsquicksetup", label: "Quick Setup", menu_items: ["menu", "xformpieces", "cache"], menu_labels: ["Quick Setups\t↓", "Transform High-Res Geometry", "Cache Simulation"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != points }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != points }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setScriptCallback("hou.phm().quickSetupsForPoints(kwargs)");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"autoscope": "0000000000000000", "script_callback": "hou.phm().quickSetupsForPoints(kwargs)", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "geodatapath", label: "Geometry Data Path", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "pack", label: "Pack Geometry Before Merging", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "pivot", label: "Pivot Location", menu_items: ["origin", "centroid"], menu_labels: ["Origin", "Centroid"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch } { pack == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch } { pack == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "viewportlod", label: "Display As", menu_items: ["full", "points", "box", "centroid", "hidden"], menu_labels: ["Full Geometry", "Point Cloud", "Bounding Box", "Centroid", "Hidden"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch } { pack == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch } { pack == 0 }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "adddopobjectpath", label: "Add DOP Object Path Attribute", default_value: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "adddopobjectname", label: "Add DOP Object Name Attribute", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "dopobjectnameattrib", label: "DOP Object Name Attribute", num_components: 1, default_value: ["dopobjectname"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch } { adddopobjectname == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "adddopdatapath", label: "Add DOP Data Path Attribute", default_value: false, default_expression: "off", default_expression_language: hou.scriptLanguage.Hscript});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template2.hideLabel(true);
			hou_parm_template2.setJoinWithNext(true);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "dopdatapathattrib", label: "DOP Data Path Attribute", num_components: 1, default_value: ["dopdatapath"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch } { adddopdatapath == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "transferattributes", label: "Transfer Attributes", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "hou.phm().buildTransferMenu(dogroups=False)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != points }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != points }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "transfergroups", label: "Transfer Groups", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "hou.phm().buildTransferMenu(dogroups=True)", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != points }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != points }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "folder_xform", label: "Transform", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "doposxform", label: "Transform Geometry With Position Data", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "dogeoxform", label: "Transform Geometry With Geometry Data", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "keepworldspacepos", label: "Preserve World Space Positions", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.MenuParmTemplate({name: "pointvels", label: "Point Velocities", menu_items: ["none", "instant", "integrate"], menu_labels: ["No Point Velocities", "Instantaneous Point Velocities", "Integrated Point Velocities"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch } { doposxform == 0 }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FloatParmTemplate({name: "integrateovertime", label: "Integrate Over Time", num_components: 1, default_value: [0], default_expression: ["1/$FPS"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch } { doposxform == 0 } { pointvels != integrate }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch } { pointvels == none }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ToggleParmTemplate({name: "addtoexistingvel", label: "Add to Existing Velocity Attributes", default_value: true});
			hou_parm_template2.setConditional(hou.parmCondType.DisableWhen, "{ importstyle != fetch } { doposxform == 0 } { pointvels == none }");
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ importstyle != fetch } { pointvels == none }");
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/dopimport::2.0',_hnt_SOP_dopimport__2_0)
    return _hnt_SOP_dopimport__2_0
}
        