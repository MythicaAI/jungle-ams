
export default function (hou) {
    class _hnt_SOP_topobuild extends hou._HoudiniBase {
        static is_root = false;
        static id = 'SOP/Other/topobuild';
        static category = '/SOP';
        static houdiniType = 'topobuild';
        static title = 'TopoBuild';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_topobuild.svg';
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
			let hou_parm_template = new hou.DataParmTemplate({name: "feedback", label: "Feedback", num_components: 1, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.hide(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "topobuild_numedits", label: "Number of Edits", folder_type: hou.folderType.TabbedMultiparmBlock, default_value: 0, ends_tab_group: false});
			let hou_parm_template2 = new hou.ToggleParmTemplate({name: "edit#_enable", label: "Enable", default_value: true});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "edit#_tool", label: "Tool", num_components: 1, default_value: ["addpoints"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: ["addpoints", "addpolygons", "bridgeconnectededges", "bridgeedges", "dissolveedges", "deletepoints", "deleteprimitives", "hideprimitives", "movepoints", "projectpoints", "rewireprimitives", "snappoints", "splitpolygons", "unhideprimitives"], menu_labels: ["Add Points", "Add Polygons", "Bridge Connected Edges", "Bridge Edges", "Dissolve Edges", "Delete Points", "Delete Primitives", "Hide Primitives", "Move Points", "Project Points", "Rewire Primitives", "Snap Points", "Split Polygons", "Unhide Primitives"], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.StringParmTemplate({name: "edit#_data", label: "Raw Data", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "topobuild_preedit", label: "Commit Edits"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ButtonParmTemplate({name: "clearall", label: "Reset All Edits"});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Other/topobuild',_hnt_SOP_topobuild)
    return _hnt_SOP_topobuild
}
        