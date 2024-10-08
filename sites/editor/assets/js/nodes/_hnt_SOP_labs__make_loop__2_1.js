
export default function (hou) {
    class _hnt_SOP_labs__make_loop__2_1 extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Labs/FX/Time/labs::make_loop::2.1';
        static category = '/SOP/labs';
        static houdiniType = 'labs::make_loop::2.1';
        static title = 'Labs Make Loop';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_labs__make_loop__2_1.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP', 'SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.MenuParmTemplate({name: "inputtype", label: "Input Type", menu_items: ["0", "1", "2"], menu_labels: ["Volume or VDB", "Particle", "Primitive"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setScriptCallback("hou.pwd().parm(\"recomputemaxid\").pressButton()");
			hou_parm_template.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template.setTags({"script_callback": "hou.pwd().parm(\"recomputemaxid\").pressButton()", "script_callback_language": "python"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FolderParmTemplate({name: "fd_loopsettings", label: "Loop Settings", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template.setTags({"group_type": "simple"});
			let hou_parm_template2 = new hou.IntParmTemplate({name: "start_frame", label: "Start Frame", num_components: 1, default_value: [0], default_expression: ["$RFSTART"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setScriptCallback("hou.pwd().parm(\"recomputemaxid\").pressButton()");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.pwd().parm(\"recomputemaxid\").pressButton()", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "end_frame", label: "End Frame", num_components: 1, default_value: [0], default_expression: ["$RFEND"], default_expression_language: [hou.scriptLanguage.Hscript], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setScriptCallback("hou.pwd().parm(\"recomputemaxid\").pressButton()");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.pwd().parm(\"recomputemaxid\").pressButton()", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.IntParmTemplate({name: "loops", label: "Num of Double-Loops", num_components: 1, default_value: [1], min: 1, max: 10, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template2.setScriptCallback("hou.pwd().parm(\"recomputemaxid\").pressButton()");
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback": "hou.pwd().parm(\"recomputemaxid\").pressButton()", "script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_volume", label: "Volume", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ inputtype != 0 }");
			hou_parm_template2.setTags({"group_type": "simple", "sidefx::look": "blank"});
			let hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm5"});
			hou_parm_template3.setTags({"sidefx::layout_height": "small", "sidefx::look": "blank"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.LabelParmTemplate({name: "lb_cachewarning", label: "lb_cachewarning", column_labels: ["It is recommended to cache memory-intensive simulations to disk \nbefore this node, because this node requires time-shifting \nthe input forward by up to half the animation duration. \n\nWithout cached files, if the necessary number of frames cannot be \nheld in memory at the same time by the solver, the looped result \nwill be incorrect."]});
			hou_parm_template3.setTags({"sidefx::look": "block"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.FolderParmTemplate({name: "fd_particle", label: "Particle", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template2.setConditional(hou.parmCondType.HideWhen, "{ inputtype != 1 }");
			hou_parm_template2.setTags({"group_type": "simple", "sidefx::look": "blank"});
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "bornbeforestartmode", label: "Born Before Loop Start", menu_items: ["0", "1"], menu_labels: ["Remove Particle", "Restart Particle Original Age at Loop Start"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "deadafterendmode", label: "Dead After Loop End", menu_items: ["0", "1"], menu_labels: ["Remove Particle", "Clamp Particle Original Life to Loop End"], default_value: 1, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ inputtype != 1 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"autoscope": "0000000000000000", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.SeparatorParmTemplate({name: "sepparm2"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "uniqueid", label: "Prevent Loops from Repeating Particle IDs", default_value: true});
			hou_parm_template3.setScriptCallback("hou.pwd().parm(\"recomputemaxid\").pressButton()");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "hou.pwd().parm(\"recomputemaxid\").pressButton()", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.MenuParmTemplate({name: "wrapmode", label: "Particle Wrap Mode", menu_items: ["0", "1", "2", "3"], menu_labels: ["Stay Alive from End to Start (Houdini)", "Die at End and Respawn as New Particles at Start (Niagara)", "Spawn at Start, Hide, and Reappear near End (Niagara)", "Never Spawn to Avoid Wrapping"], default_value: 2, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ uniqueid == 0 }");
			hou_parm_template3.setConditional(hou.parmCondType.HideWhen, "{ uniqueid == 0 }");
			hou_parm_template3.setScriptCallback("hou.pwd().parm(\"recomputemaxid\").pressButton()");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback": "hou.pwd().parm(\"recomputemaxid\").pressButton()", "script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "fadein", label: "Fade In Pscale", default_value: true});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "fadeinduration", label: "Fade-In Duration", num_components: 1, default_value: [0.2], min: 0, max: 1, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ fadein == 0 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.ToggleParmTemplate({name: "fadeout", label: "Fade Out Pscale", default_value: true});
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FloatParmTemplate({name: "fadeoutduration", label: "Fade-Out Duration", num_components: 1, default_value: [0.2], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template3.setConditional(hou.parmCondType.DisableWhen, "{ fadeout == 0 }");
			hou_parm_template3.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template3.setTags({"script_callback_language": "python"});
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template3 = new hou.FolderParmTemplate({name: "fd_vis", label: "Visualization", folder_type: hou.folderType.Simple, default_value: 0, ends_tab_group: false});
			hou_parm_template3.setTags({"group_type": "simple"});
			let hou_parm_template4 = new hou.ToggleParmTemplate({name: "previs", label: "Output Preview Geometry", default_value: false});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ inputtype != 1 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ inputtype != 1 }");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.FloatParmTemplate({name: "previsscale", label: "Preview Sphere Scale", num_components: 1, default_value: [0.2], min: 0, max: 2, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ previs == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ previs == 0 }");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template4 = new hou.ToggleParmTemplate({name: "colornage", label: "Color by Normalized Age", default_value: true});
			hou_parm_template4.setConditional(hou.parmCondType.DisableWhen, "{ previs == 0 }");
			hou_parm_template4.setConditional(hou.parmCondType.HideWhen, "{ previs == 0 }");
			hou_parm_template4.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template4.setTags({"script_callback_language": "python"});
			hou_parm_template3.addParmTemplate(hou_parm_template4);
			hou_parm_template2.addParmTemplate(hou_parm_template3);
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template2 = new hou.ButtonParmTemplate({name: "recomputemaxid", label: "Recompute Max ID"});
			hou_parm_template2.hide(true);
			hou_parm_template2.setScriptCallbackLanguage(hou.scriptLanguage.Python);
			hou_parm_template2.setTags({"script_callback_language": "python"});
			hou_parm_template.addParmTemplate(hou_parm_template2);
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Labs/FX/Time/labs::make_loop::2.1',_hnt_SOP_labs__make_loop__2_1)
    return _hnt_SOP_labs__make_loop__2_1
}
        