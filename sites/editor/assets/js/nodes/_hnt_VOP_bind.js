
export default function (hou) {
    class _hnt_VOP_bind extends hou._HoudiniBase {
        static is_root = false;
        static id = 'VOP/Other/bind';
        static category = '/VOP';
        static houdiniType = 'bind';
        static title = 'Bind';
        static icon = '/editor/assets/imgs/nodes/_hnt_VOP_bind.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['VOP'];
            const outputs = ['VOP', 'VOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.StringParmTemplate({name: "parmname", label: "Name", num_components: 1, default_value: ["parm"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "parmtype", label: "Type", menu_items: ["float", "int", "toggle", "angle", "logfloat", "float2", "float3", "vector", "normal", "point", "direction", "float4", "floatm2", "float9", "float16", "string", "file", "image", "geometry", "color", "coloralpha", "bsdf", "dict", "coshader", "surface", "displacement", "atmosphere", "light", "lightfilter", "floata", "inta", "vector2a", "vectora", "pointa", "normala", "colora", "float4a", "floatm2a", "float9a", "float16a", "stringa", "dicta", "coshadera", "struct"], menu_labels: ["Float (float)", "Integer (int)", "Toggle (int)", "Angle (float)", "Logarithmic (float)", "2 Floats (vector2)", "3 Floats (vector)", "Vector (vector)", "Normal (normal)", "Point (point)", "Direction (vector)", "4 Floats (vector4)", "4 Floats (matrix2)", "9 Floats (matrix3)", "16 Floats (matrix)", "String (string)", "File (string)", "Image (string)", "Geometry (string)", "Color (color)", "Color with Alpha (vector4)", "BSDF (F)", "Dictionary (dict)", "Co-Shader (shader)", "Surface (shader)", "Displacement (shader)", "Volume (shader)", "Light (shader)", "Light Filter (shader)", "Float Array (float[])", "Integer Array (int[])", "2 Float Array (vector2[])", "Vector Array (vector[])", "Point Array (point[])", "Normal Array (normal[])", "Color Array (color[])", "4 Float Array (vector4[])", "4 Float Array (matrix2[])", "9 Float Array (matrix3[])", "16 Float Array (matrix4[])", "String Array (string[])", "Dictionary Array (dict[])", "Co-Shader Array (shader[])", "Custom (struct)"], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template.setJoinWithNext(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "parmtypename", label: "Type Name", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template.hideLabel(true);
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "overridetype", label: "Override Type with Input", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "floatdef", label: "1 Float Default", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.IntParmTemplate({name: "intdef", label: "Integer Default", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "toggledef", label: "Toggle Default", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "angledef", label: "Angle Default", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Angle, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "logfloatdef", label: "Logarithmic Float Default", num_components: 1, default_value: [0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Logarithmic, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "float2def", label: "2 Float Default", num_components: 2, default_value: [0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "float3def", label: "3 Float Default", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "vectordef", label: "Vector Default", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "normaldef", label: "Normal Default", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "pointdef", label: "Point Default", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "directiondef", label: "Direction Default", num_components: 3, default_value: [1, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Vector, naming_scheme: hou.parmNamingScheme.XYZW});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "float4def", label: "4 Float Default", num_components: 4, default_value: [0, 0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "floatm2def", label: "4 Matrix Default", num_components: 4, default_value: [1, 0, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "float9def", label: "9 Float Default", num_components: 9, default_value: [1, 0, 0, 0, 1, 0, 0, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "float16def", label: "16 Matrix Default", num_components: 16, default_value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "stringdef", label: "String Default", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "filedef", label: "File Default", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Any, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "imagedef", label: "Image Default", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Image, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "geometrydef", label: "Geometry Default", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.FileReference, file_type: hou.fileType.Geometry, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringReplace});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "colordef", label: "Color Default", num_components: 3, default_value: [0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "color4def", label: "Color with Alpha Default", num_components: 4, default_value: [0, 0, 0, 0], min: 0, max: 10, min_is_strict: false, max_is_strict: false, look: hou.parmLook.ColorSquare, naming_scheme: hou.parmNamingScheme.RGBA});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "bsdfdef", label: "BSDF Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.DataParmTemplate({name: "dictdef", label: "Dictionary Default", num_components: 1, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "coshaderdef", label: "Co-Shader", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "surfacedef", label: "Surface Shader", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "displacementdef", label: "Displacement Shader", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "atmospheredef", label: "Volume Shader", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "lightdef", label: "Light Shader", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "lightfilterdef", label: "Light Filter Shader", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "floatadef", label: "Float Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "intadef", label: "Integer Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "vector2adef", label: "Vector2 Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "vectoradef", label: "Vector Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "pointadef", label: "Point Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "normaladef", label: "Normal Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "coloradef", label: "Color Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "floatm2adef", label: "4 Float Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "float4adef", label: "4 Float Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "float9adef", label: "9 Float Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "float16adef", label: "16 Matrix Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "stringadef", label: "String Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "dictadef", label: "Dictionary Array Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "coshaderadef", label: "Co-Shader Array Default", num_components: 1, default_value: [""], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.LabelParmTemplate({name: "structdef", label: "Custom Default", column_labels: [""]});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "useasparmdefiner", label: "Use This Node to Set Parameter Attributes", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "useownexportcontext", label: "Use Own Export Context", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "parmuniform", label: "Uniform (not Varying)", default_value: true});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "usebound", label: "Use Input Value If Not Bound", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.MenuParmTemplate({name: "exportparm", label: "Export", menu_items: [], menu_labels: [], default_value: 0, icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.Normal, menu_use_token: false, is_button_strip: false, strip_uses_icons: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.StringParmTemplate({name: "exportcontext", label: "Export in Context", num_components: 1, default_value: ["surface"], naming_scheme: hou.parmNamingScheme.Base1, string_type: hou.stringParmType.Regular, menu_items: [], menu_labels: [], icon_names: [], item_generator_script: "", item_generator_script_language: hou.scriptLanguage.Python, menu_type: hou.menuType.StringToggle});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('VOP/Other/bind',_hnt_VOP_bind)
    return _hnt_VOP_bind
}
        