import {v4 as uuidv4} from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace hou {

    /**
     * Enumeration of available script languages.
     */
     export enum scriptLanguage {
        Python = 'Python',
        Hscript = 'Hscript',
    }

    /**
     * Enumeration of parameter template types.
     */
    export enum parmTemplateType {
        Int = 'Int',
        Float = 'Float',
        String = 'String',
        Toggle = 'Toggle',
        Menu = 'Menu',
        Button = 'Button',
        FolderSet = 'FolderSet',
        Folder = 'Folder',
        Separator = 'Separator',
        Label = 'Label',
        Ramp = 'Ramp',
        Data = 'Data',
        None = 'None',
    }

    /**
     * Enumeration of parameter data types.
     */
    export enum parmData {
        Int = 'Int',
        Float = 'Float',
        String = 'String',
        Ramp = 'Ramp',
    }

    /**
     * Enumeration of available looks for a parameter.
     */
    export enum parmLook {
        Regular = 'Regular',
        Logarithmic = 'Logarithmic',
        Angle = 'Angle',
        Vector = 'Vector',
        ColorSquare = 'Colorsquare',
        HueCircle = 'Huecircle',
        CRGBAPlaneChooser = 'Crgbaplanechooser',
    }

    /**
     * Enumeration of available naming schemes for a parameter.
     */
    export enum parmNamingScheme {
        Base1 = 'Base1', // "foo1", "foo2", "foo3", …
        XYZW = 'XYZW', // "foox", "fooy", "fooz", "foow"
        XYWH = 'XYWH', // "foox", "fooy", "foow", "fooh"
        UVW = 'UVW', // "foou", "foov", "foow"
        RGBA = 'RGBA', // "foor", "foog", "foob", "fooa"
        MinMax = 'MinMax', // "foomin", "foomax"
        MaxMin = 'MaxMin', // "foomax", "foomin"
        StartEnd = 'StartEnd', // "foostart", "fooend"
        BeginEnd = 'BeginEnd', // "foobegin", "fooend"
    }

    /**
     * Enumeration of parameter condition types.
     */
    export enum parmCondType {
        DisableWhen = 'DisableWhen',
        HideWhen = 'HideWhen',
        NoCookWhen = 'NoCookWhen',
    }

    /**
     * Enumeration of parameter menu types.
     */
    export enum menuType {
        Normal = 'normal',
        Mini = 'mini',
        ControlNextParameter = 'controlNextParamater',
        StringReplace = 'stringReplace',
        StringToggle = 'stringToggle',
    }

    /**
     * Enumeration of string parameter types.
     */
    export enum stringParmType {
        Regular = 'Regular',
        FileReference = 'FileReference',
        NodeReference = 'NodeReference',
        NodeReferenceList = 'NodeReferenceList',
    }

    /**
     * Enumeration of file types.
     */
    export enum fileType {
        Any = 'Any',
        Image = 'Image',
        Geometry = 'Geometry',
        Ramp = 'Ramp',
        Capture = 'Capture',
        Clip = 'Clip',
        Lut = 'Lut',
        Cmd = 'Cmd',
        Midi = 'Midi',
        I3d = 'I3d',
        Chan = 'Chan',
        Sim = 'Sim',
        SimData = 'SimData',
        Hip = 'Hip',
        Otl = 'Otl',
        Dae = 'Dae',
        Gallery = 'Gallery',
        Directory = 'Directory',
        Icon = 'Icon',
        Ds = 'Ds',
        Alembic = 'Alembic',
        Psd = 'Psd',
        LightRig = 'LightRig',
        Gltf = 'Gltf',
        Movie = 'Movie',
        Fbx = 'Fbx',
        Usd = 'Usd',
        Sqlite = 'Sqlite',
    }

    /**
     * Enumeration of folder types for FolderParmTemplates.
     */
    export enum folderType {
        Collapsible = 'Collapsible',
        Simple = 'Simple',
        Tabs = 'Tabs',
        RadioButtons = 'RadioButtons',
        MultiparmBlock = 'MultiparmBlock',
        ScrollingMultiparmBlock = 'ScrollingMultiparmBlock',
        TabbedMultiparmBlock = 'TabbedMultiparmBlock',
        ImportBlock = 'ImportBlock',
    }

    /**
     * Enumeration of label parameter types.
     */
    export enum labelParmType {
        Heading = 'Heading',
        Label = 'Label',
        Message = 'Message',
    }

    /**
     * Enumeration of data parameter types.
     */
    export enum DataParmType {
        Geometry = 'Geometry',
        KeyValueDictionary = 'KeyValueDictionary',
    }

    /**
     * Enumeration of ramp parameter types.
     */
    export enum rampParmType {
        Color = 'Color',
        Float = 'Float',
    }

    /**
     * Enumeration of ramp interpolation types.
     */
    export enum rampBasis {
        Linear = 'Linear',
        Constant = 'Constant',
        CatmullRom = 'CatmullRom',
        MonotoneCubic = 'MonotoneCubic',
        Bezier = 'Bezier',
        BSpline = 'BSpline',
        Hermite = 'Hermite',
    }

    /**
     * Enumeration of color spaces.
     */
    export enum colorType {
        RGB = 'RGB',
        HSV = 'HSV',
        HSL = 'HSL',
        LAB = 'LAB',
        XYZ = 'XYZ',
    }


    type ParmTemplateProps = {
        id: string;
        name?: string;
        label?: string;
        type?: parmTemplateType;
        is_hidden?: boolean;
        is_label_hidden?: boolean;
        conditionals?: Partial<Record<parmCondType, string>>;
        help?: string;
        join_with_next?: boolean;
        script_callback?: string;
        script_callback_language?: scriptLanguage;
        tab_conditionals?: Partial<Record<parmCondType, string>>;
        tags?: { [key: string]: string };
        disable_when?: string;
        default_expression?: string[];
        default_expression_language?: scriptLanguage[];
    }

    export class ParmTemplate {
        id: string = uuidv4();
        type:parmTemplateType = parmTemplateType.None;
        name:string =  "_parm_template_";
        label:string = "";
        is_hidden:boolean = false;
        is_label_hidden = false;
        conditionals: Partial<Record<parmCondType, string>> = {};
        help: string = "";
        join_with_next = false;
        script_callback: string = "";
        script_callback_language: scriptLanguage = scriptLanguage.Hscript;
        tab_conditionals: Partial<Record<parmCondType, string>> = {};
        tags: { [key: string]: string } = {};
        disable_when: string = "";
        default_expression: string[] = [];
        default_expression_language: scriptLanguage[]= [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        runtime_data: { [key: string]: any } = {};

        extractConfig = (config: ParmTemplateProps) => {
            const {
                name,
                label,
                is_hidden,
                is_label_hidden,
                conditionals,
                help,
                join_with_next,
                script_callback,
                script_callback_language,
                tab_conditionals,
                tags,
                disable_when,
                default_expression,
                default_expression_language,
                ...superConfig
            } = config
            name && (this.name = name);
            label && (this.label = label);
            is_hidden && (this.is_hidden = is_hidden);
            is_label_hidden && (this.is_label_hidden = is_label_hidden);
            conditionals && (this.conditionals = conditionals);
            help && (this.help = help);
            join_with_next && (this.join_with_next = join_with_next);
            script_callback && (this.script_callback = script_callback);
            script_callback_language && (this.script_callback_language = script_callback_language);
            tab_conditionals && (this.tab_conditionals = tab_conditionals);
            tags && (this.tags = tags);
            disable_when && (this.disable_when = disable_when);
            default_expression && (this.default_expression = default_expression);
            default_expression_language && (this.default_expression_language = default_expression_language);

            return superConfig
        }
        //methods required by the transpiler
        hide(on:boolean) {this.is_hidden = on}
        hideLabel(on:boolean) {this.is_label_hidden = on}
        setConditional(condType:parmCondType,condition:string) {
            if (!this.conditionals) this.conditionals = {}
            this.conditionals[condType] = condition
        }
        setHelp(help:string){this.help = help}
        setJoinWithNext(on:boolean){this.join_with_next=on}
        setScriptCallback(script:string){this.script_callback=script}
        setScriptCallbackLanguage(script_language:scriptLanguage) {this.script_callback_language=script_language}
        setTabConditional(condType:parmCondType,condition:string) {
            if (!this.tab_conditionals) this.tab_conditionals = {}
            this.tab_conditionals[condType] = condition
        }
        setTags(tags:{ [key: string]: string }) {this.tags = tags}
        
        //"abstract" method 
        addParmTemplate = (parm_template:ParmTemplate) => {
            console.assert(
                parm_template instanceof ParmTemplate 
                || !parm_template
            )
        }
        
        //"link our component"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRuntimeData = (data:{ [key: string]: any }) => {
            this.runtime_data = data;
        }
    }
    
    type SeparatorParmTemplateProps = ParmTemplateProps;

    export class SeparatorParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Separator;
        name: string = "separator";
        
        constructor(config: SeparatorParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }
    }

    type ButtonParmTemplateProps = ParmTemplateProps;

    export class ButtonParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Button;
        name: string = "button";
        label: string = "Button";

        constructor(config: ButtonParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }
    }

    type FloatParmTemplateProps = ParmTemplateProps & {
        num_components?: number;
        default_value?: number[];
        min?: number;
        max?: number;
        min_is_strict?: boolean;
        max_is_strict?: boolean;
        look?: parmLook;
        naming_scheme?: parmNamingScheme;
    }

    export class FloatParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Float;
        name: string = "float";
        label: string = "Float";
        num_components: number = 1;
        default_value: number[] = [];
        min: number = 0.0;
        max: number = 10.0;
        min_is_strict: boolean = false;
        max_is_strict: boolean = false;
        look: parmLook = parmLook.Regular;
        naming_scheme: parmNamingScheme = parmNamingScheme.XYZW;

        constructor(config: FloatParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }
    }
 
    type IntParmTemplateProps = FloatParmTemplateProps

    export class IntParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Int; 
        name: string = "int";
        label: string = "Int";
        num_components: number = 1;
        default_value: number[] = [];
        min: number = 0;
        max: number = 10;
        min_is_strict: boolean = false;
        max_is_strict: boolean = false;
        look: parmLook = parmLook.Regular;
        naming_scheme: parmNamingScheme = parmNamingScheme.XYZW;


        constructor(config: IntParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }
    }

    type StringParmTemplateProps = ParmTemplateProps & {
        num_components?: number;
        default_value?: string[];
        naming_scheme?: parmNamingScheme;
        string_type?: stringParmType;
        file_type?: fileType;
        menu_items?: string[];
        menu_labels?: string[];
        icon_names?: string[];
        item_generator_script?: string;
        item_generator_script_language?: scriptLanguage;
        menu_type?: menuType;
    }

    export class StringParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.String;
        name: string = "string";
        label: string = "String";
        num_components: number = 1;
        default_value: string[] = [];
        naming_scheme: parmNamingScheme = parmNamingScheme.Base1;
        string_type: stringParmType = stringParmType.Regular;
        file_type: fileType = fileType.Any;
        menu_items: string[] = [];
        menu_labels: string[] = [];
        icon_names: string[] = [];
        item_generator_script: string = "";
        item_generator_script_language: scriptLanguage = scriptLanguage.Hscript;
        menu_type: menuType = menuType.Normal;
        
        constructor(config:StringParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }   
    }

    type ToggleParmTemplateProps = ParmTemplateProps & {
        default_value?: boolean;
    }

    export class ToggleParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Toggle;
        name: string = "toggle";
        label: string = "Toggle";
        default_value: boolean = false;

        constructor(config:ToggleParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }
    
    }

    type MenuParmTemplateProps = ParmTemplateProps & {
        menu_items?: string[];
        menu_labels?: string[];
        default_value?: string;
        icon_names?: string[];
        item_generator_script?: string;
        item_generator_script_language?: scriptLanguage;
        menu_type?: menuType;
        store_default_value_as_string?: boolean;
        is_menu?: boolean;
        is_button_strip?: boolean;
        strip_uses_icons?: boolean;
    }

    export class MenuParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Menu;
        name: string = "menu";
        label: string = "Menu";
        menu_items: string[] = [];
        menu_labels: string[] = [];
        default_value: string = "";
        icon_names: string[] = [];
        item_generator_script: string = "";
        item_generator_script_language: scriptLanguage = scriptLanguage.Hscript;
        menu_type: menuType = menuType.Normal;
        store_default_value_as_string: boolean = false;
        is_menu: boolean = false;
        is_button_strip: boolean = false;
        strip_uses_icons: boolean = false;

        constructor(config:MenuParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }   
    }

    
    type LabelParmTemplateProps = ParmTemplateProps & {
        column_labels?: string[];
    }

    export class LabelParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Label;
        name: string = "label";
        label: string = "Label";
        column_labels: string[] = [];
        
        constructor(config:LabelParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }   
    }

    type RampParmTemplateProps = ParmTemplateProps & {
        default_value?: number;
        default_basis?: rampBasis;
        show_controls?: boolean;
        color_type?: colorType;
    }
    export class RampParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Ramp;
        name: string = "ramp";
        label: string = "Ramp";
        default_value: number = 2;
        default_basis: rampBasis = rampBasis.Linear;
        show_controls: boolean = true;
        color_type: colorType = colorType.RGB;

        constructor(config:RampParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }   
    }

    type DataParmTemplateProps = ParmTemplateProps & {
        num_components?: number;
        look?: parmLook;
        naming_scheme?: parmNamingScheme;
    }

    export class DataParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Data;
        name: string = "data";
        label: string = "Data";
        num_components: number = 1;
        look: parmLook = parmLook.Regular;
        naming_scheme: parmNamingScheme = parmNamingScheme.XYZW;

        constructor(config:DataParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }               
    }

    type FolderParmTemplateProps = ParmTemplateProps & {
        parm_templates?: ParmTemplate[];
        folder_type?: folderType;
        ends_tab_group?: boolean;
    }
    export class FolderParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.Folder;
        level=1;
        
        name: string = "folder";
        label: string = "Folder";
        parm_templates: ParmTemplate[] = [];
        folder_type: folderType = folderType.Tabs;
        ends_tab_group: boolean = false;
        folder_set: FolderSetParmTemplate | null = null;

        constructor(config:FolderParmTemplateProps) {
            super();
            Object.assign(this, this.extractConfig(config));
        }

        /**
         * Append a parm template to the end of the list of parm templates inside the folder.
         */
        addParmTemplate = (parm_template:ParmTemplate) => {
            const prev = this.parm_templates.at(-1);
            if (parm_template instanceof FolderParmTemplate) {
                if (prev instanceof FolderSetParmTemplate && !prev.parm_templates.at(-1)?.ends_tab_group) {
                    prev.addFolderParmTemplate(parm_template, this.level+1);
                } else  {
                    const fs = new FolderSetParmTemplate();
                    this.parm_templates.push(fs);
                    fs.addFolderParmTemplate(parm_template, this.level+1);
                }
            } else {
                this.parm_templates.push(parm_template);
            }
        }
        
        /**
         * Return whether or not this parm template corresponds to an actual folder, as opposed to a multiparm or import block.
         * @returns boolean
         */
        isActualFolder = () => {
            return !(this.folder_type in [folderType.ImportBlock, folderType.MultiparmBlock])
        } 
    }
    

    export class FolderSetParmTemplate extends ParmTemplate {
        type: parmTemplateType = parmTemplateType.FolderSet; 
        parm_templates: FolderParmTemplate[] = [];

        /**
         * Append a parm template to the end of the list of parm templates inside the folder.
         */
        addFolderParmTemplate(parm_template:FolderParmTemplate, level:number=1) {
            parm_template.folder_set = this;
            parm_template.level = level;
            this.parm_templates.push(parm_template);
        }
    }

    export class ParmTemplateGroup {
        parm_templates: ParmTemplate[] = [];



        parmTemplates = () => (this.parm_templates) 
        entries = () => (this.parm_templates)
        append= (parm_template:ParmTemplate) => {
            this.addParmTemplate(parm_template)
        }

        addParmTemplate = (parm_template:ParmTemplate) => {

            const prev = this.parm_templates.at(-1);
            
            if (parm_template instanceof FolderParmTemplate) {
                if (prev && prev instanceof FolderSetParmTemplate 
                    && !prev.parm_templates.at(-1)?.ends_tab_group) {
                    prev.addFolderParmTemplate(parm_template);
                } else  {
                    const fs = new FolderSetParmTemplate();
                    this.parm_templates.push(fs);
                    fs.addFolderParmTemplate(parm_template);
                }
            } else {
                this.parm_templates.push(parm_template);
            }
        }
        draw = () => {

        }
            
    }
    
    
    
}

export default hou;