import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace hou {
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
    File = 'file',
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
    id?: string;
    name?: string;
    label?: string;
    param_type?: parmTemplateType;
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
  };

  const parmTemplateFactory = (params: ParmTemplateProps[]): ParmTemplate[] => {
    const ret: ParmTemplate[] = [];
    (Array.isArray(params) ? params : []).forEach((param) => {
      let template: ParmTemplate;
      switch (param.param_type) {
        case hou.parmTemplateType.Folder:
          template = new FolderParmTemplate(param);
          break;
        case hou.parmTemplateType.FolderSet:
          template = new FolderSetParmTemplate(param);
          break;
        case hou.parmTemplateType.String:
          template = new StringParmTemplate(param);
          break;
        case hou.parmTemplateType.Float:
          template = new FloatParmTemplate(param);
          break;
        case hou.parmTemplateType.Int:
          template = new IntParmTemplate(param);
          break;
        case hou.parmTemplateType.Toggle:
          template = new ToggleParmTemplate(param);
          break;
        case hou.parmTemplateType.Separator:
          template = new SeparatorParmTemplate(param);
          break;
        case hou.parmTemplateType.Label:
          template = new LabelParmTemplate(param);
          break;
        case hou.parmTemplateType.Menu:
          template = new MenuParmTemplate(param);
          break;
        case hou.parmTemplateType.Ramp:
          template = new RampParmTemplate(param);
          break;
        case hou.parmTemplateType.File:
          template = new FileParmTemplate(param);
          break;
        default:
          template = new ParmTemplate(param);
          break;
      }
      ret.push(template);
    });
    return ret;
  };
  export class ParmTemplate {
    id: string = uuidv4();
    param_type: parmTemplateType = parmTemplateType.None;
    name: string = '_parm_template_';
    label: string = '';
    is_hidden: boolean = false;
    is_label_hidden = false;
    conditionals: Partial<Record<parmCondType, string>> = {};
    help: string = '';
    join_with_next = false;
    script_callback: string = '';
    script_callback_language: scriptLanguage = scriptLanguage.Hscript;
    tab_conditionals: Partial<Record<parmCondType, string>> = {};
    tags: { [key: string]: string } = {};
    disable_when: string = '';
    default_expression: string[] = [];
    default_expression_language: scriptLanguage[] = [];
    default_value?: any;
    config: {} = {};

    constructor(data: dictionary) {
      this.param_type = data.param_type as hou.parmTemplateType;
      this.label = (data.label as string) || '';
      this.name = (data.name as string) || '';
    }

    extractConfig = (config: ParmTemplateProps) => {
      this.config = config;
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
      } = config;
      if (name) this.name = name;
      if (label) this.label = label;
      if (is_hidden) this.is_hidden = is_hidden;
      if (is_label_hidden) this.is_label_hidden = is_label_hidden;
      if (conditionals) this.conditionals = conditionals;
      if (help) this.help = help;
      if (join_with_next) this.join_with_next = join_with_next;
      if (script_callback) this.script_callback = script_callback;
      if (script_callback_language)
        this.script_callback_language = script_callback_language;
      if (tab_conditionals) this.tab_conditionals = tab_conditionals;
      if (tags) this.tags = tags;
      if (disable_when) this.disable_when = disable_when;
      if (default_expression) this.default_expression = default_expression;
      if (default_expression_language)
        this.default_expression_language = default_expression_language;

      return superConfig;
    };
    //methods required by the transpiler
    hide(on: boolean) {
      this.is_hidden = on;
    }
    hideLabel(on: boolean) {
      this.is_label_hidden = on;
    }
    setConditional(condType: parmCondType, condition: string) {
      if (!this.conditionals) this.conditionals = {};
      this.conditionals[condType] = condition;
    }
    setHelp(help: string) {
      this.help = help;
    }
    setJoinWithNext(on: boolean) {
      this.join_with_next = on;
    }
    setScriptCallback(script: string) {
      this.script_callback = script;
    }
    setScriptCallbackLanguage(script_language: scriptLanguage) {
      this.script_callback_language = script_language;
    }
    setTabConditional(condType: parmCondType, condition: string) {
      if (!this.tab_conditionals) this.tab_conditionals = {};
      this.tab_conditionals[condType] = condition;
    }
    setTags(tags: { [key: string]: string }) {
      this.tags = tags;
    }
    clone() {
      const ret = parmTemplateFactory([this.config])[0];
      ret.is_hidden = this.is_hidden;
      ret.is_label_hidden = this.is_label_hidden;
      ret.conditionals = structuredClone(this.conditionals);
      ret.help = this.help;
      ret.join_with_next = this.join_with_next;
      ret.script_callback = this.script_callback;
      ret.script_callback_language = this.script_callback_language;
      ret.tab_conditionals = structuredClone(this.tab_conditionals);
      ret.tags = structuredClone(this.tags);
      
      return ret;
    }
  }

  type FileParmTemplateProps = ParmTemplateProps;

  export class FileParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.File;
    name: string = 'file';
    default: string | string[] = "";

    constructor(config: FileParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
  }

  type SeparatorParmTemplateProps = ParmTemplateProps;

  export class SeparatorParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Separator;
    name: string = 'separator';

    constructor(config: SeparatorParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
  }

  type ButtonParmTemplateProps = ParmTemplateProps;

  export class ButtonParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Button;
    name: string = 'button';
    label: string = 'Button';

    constructor(config: ButtonParmTemplateProps) {
      super(config);
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
  };

  export class FloatParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Float;
    name: string = 'float';
    label: string = 'Float';
    num_components: number = 1;
    default_value: number[] = [];
    min: number = 0.0;
    max: number = 10.0;
    min_is_strict: boolean = false;
    max_is_strict: boolean = false;
    look: parmLook = parmLook.Regular;
    naming_scheme: parmNamingScheme = parmNamingScheme.XYZW;

    constructor(config: FloatParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
  }

  type IntParmTemplateProps = FloatParmTemplateProps;

  export class IntParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Int;
    name: string = 'int';
    label: string = 'Int';
    num_components: number = 1;
    default_value: number[] = [];
    min: number = 0;
    max: number = 10;
    min_is_strict: boolean = false;
    max_is_strict: boolean = false;
    look: parmLook = parmLook.Regular;
    naming_scheme: parmNamingScheme = parmNamingScheme.XYZW;

    constructor(config: IntParmTemplateProps) {
      super(config);
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
  };

  export class StringParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.String;
    name: string = 'string';
    label: string = 'String';
    num_components: number = 1;
    default_value: string[] = [];
    naming_scheme: parmNamingScheme = parmNamingScheme.Base1;
    string_type: stringParmType = stringParmType.Regular;
    file_type: fileType = fileType.Any;
    menu_items: string[] = [];
    menu_labels: string[] = [];
    icon_names: string[] = [];
    item_generator_script: string = '';
    item_generator_script_language: scriptLanguage = scriptLanguage.Hscript;
    menu_type: menuType = menuType.Normal;

    constructor(config: StringParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
  }

  type ToggleParmTemplateProps = ParmTemplateProps & {
    default_value?: boolean;
  };

  export class ToggleParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Toggle;
    name: string = 'toggle';
    label: string = 'Toggle';
    default_value: boolean = false;

    constructor(config: ToggleParmTemplateProps) {
      super(config);
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
  };

  export class MenuParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Menu;
    name: string = 'menu';
    label: string = 'Menu';
    menu_items: string[] = [];
    menu_labels: string[] = [];
    default_value: string = '';
    icon_names: string[] = [];
    item_generator_script: string = '';
    item_generator_script_language: scriptLanguage = scriptLanguage.Hscript;
    menu_type: menuType = menuType.Normal;
    store_default_value_as_string: boolean = false;
    is_menu: boolean = false;
    is_button_strip: boolean = false;
    strip_uses_icons: boolean = false;

    constructor(config: MenuParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
  }

  type LabelParmTemplateProps = ParmTemplateProps & {
    column_labels?: string[];
  };

  export class LabelParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Label;
    name: string = 'label';
    label: string = 'Label';
    column_labels: string[] = [];

    constructor(config: LabelParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
  }

  type RampParmTemplateProps = ParmTemplateProps & {
    default_value?: number;
    default_basis?: rampBasis;
    show_controls?: boolean;
    ramp_parm_type?: rampParmType;
    color_type?: colorType;
  };
  export class RampParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Ramp;
    name: string = 'ramp';
    label: string = 'Ramp';
    default_value: number = 2;
    default_points: Array<{
      pos: number;
      c?: number[];
      value?: number;
      interp: rampBasis;
    }> = [];
    default_basis: rampBasis = rampBasis.Linear;
    ramp_parm_type: rampParmType = rampParmType.Float;
    show_controls: boolean = true;
    color_type: colorType = colorType.RGB;

    constructor(config: RampParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
    setTags = (tags: { [key: string]: string }) => {
      this.tags = tags;
      this.default_points = this.fillRampDefaults();
    };
    fillRampDefaults = () => {
      const isColorRamp = this.ramp_parm_type === hou.rampParmType.Color;
      const valueKey = isColorRamp ? 'c' : 'value';
      const rampStr = this.tags[
        isColorRamp ? 'rampcolordefault' : 'rampfloatdefault'
      ] as string;

      // We look for sequences of:
      // Npos ( number ) NvalueOrC ( number(s) ) Ninterp ( string )
      // For color ramps (c), we expect three floats inside the parentheses for 'c'.
      // For float ramps (value), we expect one float.
      // (\d+)pos\s*\(\s*([^)]+)\)   -> Captures the index (N) and the position (x)
      // \1value|c\s*\(\s*([^)]+)\) -> Using a backreference \1 ensures we match the same index for value/c
      // \1interp\s*\(\s*([^)]+)\)  -> Matches the same index followed by interp
      //
      // Using a slightly more flexible approach:
      const pattern = new RegExp(
        String.raw`(\d+)pos\s*\(\s*([^)]+)\)\s*\1${valueKey}\s*\(\s*([^)]+)\)\s*\1interp\s*\(\s*([^)]+)\)`,
        'g'
      );
      let match: RegExpExecArray | null;
      const points = [];

      while ((match = pattern.exec(rampStr)) !== null) {
        // match[1]: index (unused except for pattern consistency)
        // match[2]: pos (x)
        // match[3]: value or c fields
        // match[4]: interp
        const pos = parseFloat(match[2].trim());
        const interpStr = match[4].trim().toLowerCase();

        // Convert interpolation string to RampBasis enum or keep as string
        let interp: hou.rampBasis;
        switch (interpStr) {
          case 'bspline':
            interp = rampBasis.BSpline;
            break;
          case 'linear':
            interp = rampBasis.Linear;
            break;
          case 'constant':
            interp = rampBasis.Constant;
            break;
          case 'catmullrom':
            interp = rampBasis.CatmullRom;
            break;
          case 'monotonecubic':
            interp = rampBasis.MonotoneCubic;
            break;
          case 'bezier':
            interp = rampBasis.Bezier;
            break;
          case 'hermite':
            interp = rampBasis.Hermite;
            break;
          default:
            interp = rampBasis.Constant;
        }

        if (isColorRamp) {
          // For color ramps, we have three floats for 'c'
          const colorVals = match[3].trim().split(/\s+/).map(parseFloat);
          if (colorVals.length !== 3) {
            throw new Error('Color ramp point did not have exactly 3 values');
          }
          points.push({
            pos,
            c: [colorVals[0], colorVals[1], colorVals[2]],
            interp: interp,
          });
        } else {
          // For float ramps, we have a single float for 'value'
          const val = parseFloat(match[3].trim());
          points.push({
            pos,
            value: val,
            interp,
          });
        }
      }
      return points;
    };
  }

  type DataParmTemplateProps = ParmTemplateProps & {
    num_components?: number;
    look?: parmLook;
    naming_scheme?: parmNamingScheme;
  };

  export class DataParmTemplate extends ParmTemplate {
    param_type: parmTemplateType = parmTemplateType.Data;
    name: string = 'data';
    label: string = 'Data';
    num_components: number = 1;
    look: parmLook = parmLook.Regular;
    naming_scheme: parmNamingScheme = parmNamingScheme.XYZW;

    constructor(config: DataParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
    }
  }

  type FolderParmTemplateProps = ParmTemplateProps & {
    parm_templates?: ParmTemplate[];
    folder_type?: folderType;
    ends_tab_group?: boolean;
  };

  export interface ParmTemplateCollector {
    addParmTemplate: (parm_template: ParmTemplate) => void;
    removeParmTemplate: (parm_template: ParmTemplate) => ParmTemplate | null;
    parm_templates: ParmTemplate[];
  }
  
  export class FolderParmTemplate extends ParmTemplate implements ParmTemplateCollector {
    param_type: parmTemplateType = parmTemplateType.Folder;
    
    name: string = 'folder';
    label: string = 'Folder';
    parm_templates: ParmTemplate[] = [];
    folder_type: folderType = folderType.Tabs;
    ends_tab_group: boolean = false;
    folder_set: FolderSetParmTemplate | null = null;
    runtime_data: { [key: string]: unknown } = {};
   

    constructor(config: FolderParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));

      this.runtime_data.isActive = false;
      this.parm_templates = parmTemplateFactory(config.parm_templates || []);
    }

    clone() {
      const ret = super.clone() as FolderParmTemplate;
      ret.parm_templates = this.parm_templates.map(pt => pt.clone());
      return ret;
    }

    /**
     * Append a parm template to the end of the list of parm templates inside the folder.
     */
    addParmTemplate = (parm_template: ParmTemplate) => {
      const prev = this.parm_templates.at(-1);
      if (parm_template instanceof FolderParmTemplate) {
        if (
          prev instanceof FolderSetParmTemplate &&
          !prev.parm_templates.at(-1)?.ends_tab_group
        ) {
          prev.addParmTemplate(parm_template);
        } else {
          const fs = new FolderSetParmTemplate({});
          this.parm_templates.push(fs);
          fs.addParmTemplate(parm_template);
        }
      } else {
        this.parm_templates.push(parm_template);
      }
    };
    /**
     * Remove a parm template from the list of parm templates inside the folder.
     */
    removeParmTemplate = (parm_template: ParmTemplate) => {
      const index = this.parm_templates.indexOf(parm_template);
      if (index !== -1) {
        return this.parm_templates.splice(index, 1)[0];
      }
      return null;
    };

    /**
     * Return whether or not this parm template corresponds to an actual folder, as opposed to a multiparm or import block.
     * @returns boolean
     */
    isActualFolder = () => {
      return !(
        this.folder_type in [folderType.ImportBlock, folderType.MultiparmBlock]
      );
    };
  }

  type FolderSetParmTemplateProps = ParmTemplateProps & {
    parm_templates?: ParmTemplate[];
  };

  export class FolderSetParmTemplate extends ParmTemplate implements ParmTemplateCollector {
    param_type: parmTemplateType = parmTemplateType.FolderSet;
    parm_templates: FolderParmTemplate[] = [];

    constructor(config: FolderSetParmTemplateProps) {
      super(config);
      Object.assign(this, this.extractConfig(config));
      this.parm_templates = parmTemplateFactory(
        config.parm_templates || []
      ) as FolderParmTemplate[];
    }
    clone() {
      const ret = super.clone() as FolderParmTemplate;
      ret.parm_templates = this.parm_templates.map(pt => pt.clone());
      return ret;
    }

    /**
     * Append a parm template to the end of the list of parm templates inside the folder.
     */
    addParmTemplate(
      parm_template: ParmTemplate,
    ) {
      const pt = parm_template as FolderParmTemplate; 
      pt.folder_set = this;
      this.parm_templates.push(pt);
    }
    /**
     * Remove a parm template from the list of parm templates inside the folder.
     */
    removeParmTemplate = (parm_template: ParmTemplate) => {
      const pt = parm_template as FolderParmTemplate;
      const index = this.parm_templates.indexOf(pt);
      if (index !== -1) {
        return this.parm_templates.splice(index, 1)[0];
      }
      return null;
    };
  }
  

  export class ParmTemplateGroup implements ParmTemplateCollector {
    parm_templates: ParmTemplate[] = [];

    constructor(params_v2: dictionary[]) {
      this.parm_templates = parmTemplateFactory(params_v2);
    }

    parmTemplates = () => this.parm_templates;
    entries = () => this.parm_templates;
    append = (parm_template: ParmTemplate) => {
      this.addParmTemplate(parm_template);
    };

    addParmTemplate = (parm_template: ParmTemplate) => {
      const prev = this.parm_templates.at(-1);

      if (parm_template instanceof FolderParmTemplate) {
        if (
          prev &&
          prev instanceof FolderSetParmTemplate &&
          !prev.parm_templates.at(-1)?.ends_tab_group
        ) {
          prev.addParmTemplate(parm_template);
        } else {
          const fs = new FolderSetParmTemplate({});
          this.parm_templates.push(fs);
          fs.addParmTemplate(parm_template);
        }
      } else {
        this.parm_templates.push(parm_template);
      }
    };
    /**
     * Remove a parm template from the list of parm templates inside the folder.
     */
    removeParmTemplate = (parm_template: ParmTemplate) => {
      const index = this.parm_templates.indexOf(parm_template);
      if (index !== -1) {
        return this.parm_templates.splice(index, 1)[0];
      }
      return null;
    };
    draw = () => {};
  }
}

export default hou;

export type dictionary = {
  [key: string]: unknown;
};
