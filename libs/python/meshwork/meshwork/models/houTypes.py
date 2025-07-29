from enum import Enum


class scriptLanguage(str, Enum):
    """
    Enumeration of available script languages.
    """

    Python = "Python"
    Hscript = "Hscript"


class parmTemplateType(str, Enum):
    """
    Enumeration of parameter template types.
    """

    Int = "Int"
    Float = "Float"
    String = "String"
    Toggle = "Toggle"
    Menu = "Menu"
    Button = "Button"
    FolderSet = "FolderSet"
    Folder = "Folder"
    Separator = "Separator"
    Label = "Label"
    Ramp = "Ramp"
    Data = "Data"
    NoneType = "None"


class parmData(str, Enum):
    """
    Enumeration of parameter data types.
    """

    Int = "Int"
    Float = "Float"
    String = "String"
    Ramp = "Ramp"


class parmLook(str, Enum):
    """
    Enumeration of available looks for a parameter.
    """

    Regular = "Regular"
    Logarithmic = "Logarithmic"
    Angle = "Angle"
    Vector = "Vector"
    ColorSquare = "Colorsquare"
    HueCircle = "Huecircle"
    CRGBAPlaneChooser = "Crgbaplanechooser"


class parmNamingScheme(str, Enum):
    """
    Enumeration of available naming schemes for a parameter.
    """

    Base1 = "Base1"  # "foo1", "foo2", "foo3", …
    XYZW = "XYZW"  # "foox", "fooy", "fooz", "foow"
    XYWH = "XYWH"  # "foox", "fooy", "foow", "fooh"
    UVW = "UVW"  # "foou", "foov", "foow"
    RGBA = "RGBA"  # "foor", "foog", "foob", "fooa"
    MinMax = "MinMax"  # "foomin", "foomax"
    MaxMin = "MaxMin"  # "foomax", "foomin"
    StartEnd = "StartEnd"  # "foostart", "fooend"
    BeginEnd = "BeginEnd"  # "foobegin", "fooend"


class parmCondType(str, Enum):
    """
    Enumeration of parameter condition types.
    """

    DisableWhen = "DisableWhen"
    HideWhen = "HideWhen"
    NoCookWhen = "NoCookWhen"


class menuType(str, Enum):
    """
    Enum representing different menu types.
    """

    Normal = "normal"
    Mini = "mini"
    ControlNextParameter = "controlNextParamater"
    StringReplace = "stringReplace"
    StringToggle = "stringToggle"


class stringParmType(str, Enum):
    """
    Enum representing different string parameter types.
    """

    Regular = "Regular"
    FileReference = "FileReference"
    NodeReference = "NodeReference"
    NodeReferenceList = "NodeReferenceList"


class fileType(str, Enum):
    """
    Enum representing different file types.
    """

    Any = "Any"
    Image = "Image"
    Geometry = "Geometry"
    Ramp = "Ramp"
    Capture = "Capture"
    Clip = "Clip"
    Lut = "Lut"
    Cmd = "Cmd"
    Midi = "Midi"
    I3d = "I3d"
    Chan = "Chan"
    Sim = "Sim"
    SimData = "SimData"
    Hip = "Hip"
    Otl = "Otl"
    Dae = "Dae"
    Gallery = "Gallery"
    Directory = "Directory"
    Icon = "Icon"
    Ds = "Ds"
    Alembic = "Alembic"
    Psd = "Psd"
    LightRig = "LightRig"
    Gltf = "Gltf"
    Movie = "Movie"
    Fbx = "Fbx"
    Usd = "Usd"
    Sqlite = "Sqlite"


class folderType(str, Enum):
    """
    Enum representing different folder behaviors.
    """

    Collapsible = "Collapsible"
    Simple = "Simple"
    Tabs = "Tabs"
    RadioButtons = "RadioButtons"
    MultiparmBlock = "MultiparmBlock"
    ScrollingMultiparmBlock = "ScrollingMultiparmBlock"
    TabbedMultiparmBlock = "TabbedMultiparmBlock"
    ImportBlock = "ImportBlock"


class labelParmType(str, Enum):
    """
    Enum representing different label parameter types.
    """

    Heading = "Heading"
    Label = "Label"
    Message = "Message"


class dataParmType(str, Enum):
    """
    Enum representing different data parameter types.
    """

    Geometry = "Geometry"
    KeyValueDictionary = "KeyValueDictionary"


class rampParmType(str, Enum):
    """
    Enum representing types of ramp parameters
    """

    Color = "Color"
    Float = "Float"


class rampBasis(str, Enum):
    """
    Enum representing ramp basis types
    """

    Linear = "Linear"
    Constant = "Constant"
    CatmullRom = "CatmullRom"
    MonotoneCubic = "MonotoneCubic"
    Bezier = "Bezier"
    BSpline = "BSpline"
    Hermite = "Hermite"


class colorType(str, Enum):
    """
    Enum representing different color types
    """

    RGB = "RGB"
    HSV = "HSV"
    HSL = "HSL"
    LAB = "LAB"
    XYZ = "XYZ"
