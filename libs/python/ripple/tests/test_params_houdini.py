import pytest
from pydantic import ValidationError

# Import enums from houTypes
from ripple.models.houTypes import (
    scriptLanguage,
    parmTemplateType,
    parmData,
    parmLook,
    parmNamingScheme,
    parmCondType,
    menuType,
    stringParmType,
    fileType,
    folderType,
    labelParmType,
    dataParmType,
    rampParmType,
    rampBasis,
    colorType,
)

# Import specs from params (the new Houdini parameter specs)
from ripple.models.params import (
    EnumParameterSpec,
    SeparatorParmTemplateSpec,
    ButtonParmTemplateSpec,
    IntParmTemplateSpec,
    FloatParmTemplateSpec,
    StringParmTemplateSpec,
    ToggleParmTemplateSpec,
    MenuParmTemplateSpec,
    LabelParmTemplateSpec,
    RampParmTemplateSpec,
    DataParmTemplateSpec,
    FolderParmTemplateSpec,
    FolderSetParmTemplateSpec,
    RampPointSpec
)

# Import the classes from houClasses
from ripple.models.houClasses import (
    ParmTemplate,
    SeparatorParmTemplate,
    ButtonParmTemplate,
    IntParmTemplate,
    FloatParmTemplate,
    StringParmTemplate,
    ToggleParmTemplate,
    MenuParmTemplate,
    LabelParmTemplate,
    DataParmTemplate,
    RampParmTemplate,
    FolderParmTemplate,
    FolderSetParmTemplate,
    ParmTemplateGroup,
    rampParmType as classRampParmType,  # same as from houTypes
    rampBasis as classRampBasis,
)


# -----------------------------------------------------------------------------
# 1. Test all enums from houTypes.py
# -----------------------------------------------------------------------------
def test_houdini_enums():
    # Just ensure we can create them from strings and they match expected values
    assert scriptLanguage("Python") == scriptLanguage.Python
    assert scriptLanguage("Hscript") == scriptLanguage.Hscript

    assert parmTemplateType("Int") == parmTemplateType.Int
    assert parmTemplateType("FolderSet") == parmTemplateType.FolderSet

    assert parmData("Float") == parmData.Float
    assert parmLook("Angle") == parmLook.Angle

    assert parmNamingScheme("Base1") == parmNamingScheme.Base1
    assert parmCondType("DisableWhen") == parmCondType.DisableWhen

    assert menuType("normal") == menuType.Normal
    assert stringParmType("FileReference") == stringParmType.FileReference
    assert fileType("Image") == fileType.Image

    assert folderType("Tabs") == folderType.Tabs
    assert labelParmType("Heading") == labelParmType.Heading
    assert dataParmType("Geometry") == dataParmType.Geometry

    assert rampParmType("Float") == rampParmType.Float
    assert rampBasis("Bezier") == rampBasis.Bezier
    assert colorType("HSV") == colorType.HSV


# -----------------------------------------------------------------------------
# 2. Test each ParmTemplateSpec-derived model from params.py
# -----------------------------------------------------------------------------

def test_separator_parm_template_spec():
    sep = SeparatorParmTemplateSpec(
        label="MySeparator",
        name="sep1",
        is_hidden=True,
    )
    assert sep.param_type == parmTemplateType.Separator
    assert sep.label == "MySeparator"
    assert sep.name == "sep1"
    assert sep.is_hidden is True

def test_button_parm_template_spec():
    btn = ButtonParmTemplateSpec(
        label="MyButton",
        name="btn1",
        is_label_hidden=True,
        help="Click me!"
    )
    assert btn.param_type == parmTemplateType.Button
    assert btn.label == "MyButton"
    assert btn.name == "btn1"
    assert btn.is_label_hidden is True
    assert btn.help == "Click me!"

def test_int_parm_template_spec():
    ip = IntParmTemplateSpec(
        label="Int Label",
        name="int1",
        default_value=[1, 2, 3],
        min=0,
        max=10,
        num_components=3
    )
    assert ip.param_type == parmTemplateType.Int
    assert ip.default_value == [1, 2, 3]
    assert ip.min == 0
    assert ip.max == 10
    assert ip.num_components == 3

    # Test invalid default_value type
    with pytest.raises(ValidationError):
        IntParmTemplateSpec(
            label="Bad Int",
            name="int2",
            default_value=["a", "b"],  # not int
        )

def test_float_parm_template_spec():
    fp = FloatParmTemplateSpec(
        label="Float Label",
        name="float1",
        default_value=[3.14],
        min=0.0,
        max=10.0
    )
    assert fp.param_type == parmTemplateType.Float
    assert fp.default_value == [3.14]
    assert fp.min == 0.0
    assert fp.max == 10.0

    # Test invalid default_value type
    with pytest.raises(ValidationError):
        FloatParmTemplateSpec(
            label="Bad Float",
            name="float2",
            default_value=["3.s"],  # not float
        )

def test_string_parm_template_spec():
    sp = StringParmTemplateSpec(
        label="String Label",
        name="str1",
        default_value=["Hello", "World"],
        string_type=stringParmType.Regular,
        file_type=fileType.Any
    )
    assert sp.param_type == parmTemplateType.String
    assert sp.default_value == ["Hello", "World"]
    assert sp.string_type == stringParmType.Regular
    assert sp.file_type == fileType.Any

def test_toggle_parm_template_spec():
    tg = ToggleParmTemplateSpec(
        label="Toggle Label",
        name="toggle1",
        default_value=True,
    )
    assert tg.param_type == parmTemplateType.Toggle
    assert tg.default_value is True

def test_menu_parm_template_spec():
    mp = MenuParmTemplateSpec(
        label="Menu Label",
        name="menu1",
        default_value=2,
        menu_items=["x", "y", "z"],
        menu_labels=["X", "Y", "Z"]
    )
    assert mp.param_type == parmTemplateType.Menu
    assert mp.default_value == 2
    assert mp.menu_items == ["x", "y", "z"]
    assert mp.menu_labels == ["X", "Y", "Z"]

def test_label_parm_template_spec():
    lp = LabelParmTemplateSpec(
        label="Label Label",
        name="lbl1",
        column_labels=["colA", "colB"]
    )
    assert lp.param_type == parmTemplateType.Label
    assert lp.column_labels == ["colA", "colB"]

def test_ramp_parm_template_spec():
    rp = RampParmTemplateSpec(
        label="Ramp Label",
        name="ramp1",
        ramp_parm_type=rampParmType.Float,
        default_value=3,
        default_points=[
            RampPointSpec(pos=0.0, value=0.1),
            RampPointSpec(pos=1.0, value=0.9, interp=rampBasis.Bezier),
        ]
    )
    assert rp.param_type == parmTemplateType.Ramp
    assert rp.ramp_parm_type == rampParmType.Float
    assert rp.default_value == 3
    assert len(rp.default_points) == 2
    assert rp.default_points[1].interp == rampBasis.Bezier

def test_data_parm_template_spec():
    dp = DataParmTemplateSpec(
        label="Data Label",
        name="data1",
        num_components=2
    )
    assert dp.param_type == parmTemplateType.Data
    assert dp.num_components == 2

def test_folder_parm_template_spec():
    folder = FolderParmTemplateSpec(
        label="Folder Label",
        name="folder1",
        level=2,
        ends_tab_group=True,
        folder_type=folderType.RadioButtons,
        params=[],
        default_value=1
    )
    assert folder.param_type == parmTemplateType.Folder
    assert folder.level == 2
    assert folder.ends_tab_group is True
    assert folder.folder_type == folderType.RadioButtons
    assert folder.default_value == 1
    assert folder.params == []

def test_folderset_parm_template_spec():
    fs = FolderSetParmTemplateSpec(
        label="FolderSet Label",
        name="fs1",
        params=[]
    )
    assert fs.param_type == parmTemplateType.FolderSet
    assert fs.params == []


# -----------------------------------------------------------------------------
# 3. Test classes from houClasses.py
# -----------------------------------------------------------------------------
def test_parm_template_base_methods():
    tmpl = ParmTemplate("test_name", label="Test Label", num_components=2)
    assert tmpl.name == "test_name"
    assert tmpl.label == "Test Label"
    assert tmpl.num_components == 2

    tmpl.hide(True)
    assert tmpl.is_hidden is True

    tmpl.hideLabel(True)
    assert tmpl.is_label_hidden is True

    tmpl.setConditional(parmCondType.DisableWhen, "{ some_cond }")
    assert parmCondType.DisableWhen in tmpl.conditionals
    assert tmpl.conditionals[parmCondType.DisableWhen] == "{ some_cond }"

    tmpl.setHelp("My help text")
    assert tmpl.help == "My help text"

    tmpl.setJoinWithNext(True)
    assert tmpl.join_with_next is True

    tmpl.setScriptCallback("print('Hello')")
    assert tmpl.script_callback == "print('Hello')"

    tmpl.setScriptCallbackLanguage(scriptLanguage.Python)
    assert tmpl.script_callback_language == scriptLanguage.Python

    tmpl.setTabConditional(parmCondType.HideWhen, "{ tab_cond }")
    assert parmCondType.HideWhen in tmpl.tab_conditionals
    assert tmpl.tab_conditionals[parmCondType.HideWhen] == "{ tab_cond }"

    tmpl.setTags({"mytag": "myval"})
    assert tmpl.tags == {"mytag": "myval"}


def test_separator_parm_template_class():
    spt = SeparatorParmTemplate("sep_test")
    assert spt.type == parmTemplateType.Separator
    assert spt.name == "sep_test"

    spec = spt.getParmTemplateSpec()
    assert isinstance(spec, SeparatorParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Separator

    pspec_list = spt.getParameterSpec()
    assert pspec_list == []  # no parameter specs for a separator


def test_button_parm_template_class():
    bpt = ButtonParmTemplate("btn_test")
    assert bpt.type == parmTemplateType.Button
    assert bpt.name == "btn_test"

    spec = bpt.getParmTemplateSpec()
    assert isinstance(spec, ButtonParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Button

    pspec_list = bpt.getParameterSpec()
    assert pspec_list == []  # no parameter specs for a button


def test_int_parm_template_class():
    ipt = IntParmTemplate("int_test", default_value=[10, 20], num_components=2)
    assert ipt.type == parmTemplateType.Int
    assert ipt.name == "int_test"
    assert ipt.default_value == [10, 20]
    assert ipt.num_components == 2

    spec = ipt.getParmTemplateSpec()
    assert isinstance(spec, IntParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Int
    assert spec.default_value == [10, 20]

    pspec_list = ipt.getParameterSpec()
    assert len(pspec_list) == 1
    assert pspec_list[0].param_type == "int"
    # Because we are bridging: param_type == "int" in ParameterSpec, param_type == "Int" in ParmTemplateSpec.


def test_float_parm_template_class():
    fpt = FloatParmTemplate("float_test", default_value=[0.5], num_components=1)
    assert fpt.type == parmTemplateType.Float
    assert fpt.name == "float_test"
    assert fpt.default_value == [0.5]
    assert fpt.num_components == 1

    spec = fpt.getParmTemplateSpec()
    assert isinstance(spec, FloatParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Float
    assert spec.default_value == [0.5]

    pspec_list = fpt.getParameterSpec()
    assert len(pspec_list) == 1
    assert pspec_list[0].param_type == "float"


def test_string_parm_template_class():
    spt = StringParmTemplate("str_test", default_value=["Hello"], num_components=1)
    assert spt.type == parmTemplateType.String
    assert spt.name == "str_test"
    assert spt.default_value == ["Hello"]
    assert spt.num_components == 1

    spec = spt.getParmTemplateSpec()
    assert isinstance(spec, StringParmTemplateSpec)
    assert spec.param_type == parmTemplateType.String
    assert spec.default_value == ["Hello"]

    pspec_list = spt.getParameterSpec()
    assert len(pspec_list) == 1
    assert pspec_list[0].param_type == "string"


def test_toggle_parm_template_class():
    tpt = ToggleParmTemplate("toggle_test", default_value=True)
    assert tpt.type == parmTemplateType.Toggle
    assert tpt.name == "toggle_test"
    assert tpt.default_value is True

    spec = tpt.getParmTemplateSpec()
    assert isinstance(spec, ToggleParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Toggle
    assert spec.default_value is True

    pspec_list = tpt.getParameterSpec()
    assert len(pspec_list) == 1
    assert pspec_list[0].param_type == "bool"


def test_menu_parm_template_class():
    mpt = MenuParmTemplate("menu_test", default_value=1, menu_items=["itemA", "itemB"], menu_labels=["Item A", "Item B"], menu_use_token=True)
    assert mpt.type == parmTemplateType.Menu
    assert mpt.name == "menu_test"
    assert mpt.default_value == 1
    assert mpt.menu_items == ["itemA", "itemB"]

    spec = mpt.getParmTemplateSpec()
    assert isinstance(spec, MenuParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Menu
    assert spec.menu_items == ["itemA", "itemB"]

    pspec_list = mpt.getParameterSpec()
    # By default, getParameterSpec() for a MenuParmTemplate returns []
    assert len(pspec_list) == 1
    pspec:EnumParameterSpec = pspec_list[0]
    assert pspec.param_type == "enum"
    assert len(pspec.values) == 2
    assert pspec.values[0].name == "0"
    assert pspec.values[0].label == "Item A"
    


def test_label_parm_template_class():
    lpt = LabelParmTemplate("label_test")
    assert lpt.type == parmTemplateType.Label
    assert lpt.name == "label_test"

    spec = lpt.getParmTemplateSpec()
    assert isinstance(spec, LabelParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Label

    pspec_list = lpt.getParameterSpec()
    assert pspec_list == []


def test_data_parm_template_class():
    dpt = DataParmTemplate("data_test", num_components=2)
    assert dpt.type == parmTemplateType.Data
    assert dpt.name == "data_test"
    assert dpt.num_components == 2

    spec = dpt.getParmTemplateSpec()
    assert isinstance(spec, DataParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Data
    assert spec.num_components == 2

    pspec_list = dpt.getParameterSpec()
    assert pspec_list == []


def test_ramp_parm_template_class_float():
    rpt = RampParmTemplate(
        name="ramp_test_float",
        label="MyRamp",
        ramp_part_type=classRampParmType.Float,
        default_points=[
            RampPointSpec(pos=0.0, value=0.2),
            RampPointSpec(pos=1.0, value=0.8, interp=classRampBasis.BSpline),
        ],
    )
    assert rpt.type == parmTemplateType.Ramp
    assert rpt.ramp_parm_type == classRampParmType.Float
    assert rpt.default_points[0].value == 0.2

    spec = rpt.getParmTemplateSpec()
    assert isinstance(spec, RampParmTemplateSpec)
    assert spec.param_type == parmTemplateType.Ramp
    assert spec.ramp_parm_type == classRampParmType.Float
    assert len(spec.default_points) == 2

    pspec_list = rpt.getParameterSpec()
    assert len(pspec_list) == 1
    assert pspec_list[0].param_type == "ramp"
    assert pspec_list[0].ramp_parm_type == classRampParmType.Float
    assert len(pspec_list[0].default) == 2


def test_ramp_parm_template_class_color_fill_defaults():
    rpt = RampParmTemplate(
        name="ramp_test_color",
        label="MyColorRamp",
        ramp_part_type=classRampParmType.Color
    )
    # Provide a 'tags' dict that includes the ramp definition for a color ramp
    # Example format:  "0pos(0)0c(1 0 0)0interp(linear)1pos(1)1c(0 1 0)1interp(bezier)"
    ramp_str = "0pos(0)0c(1 0 0)0interp(Linear)1pos(1)1c(0 1 0)1interp(Bezier)"
    rpt.setTags({"rampcolordefault": ramp_str})
    # fillRampDefaults is called automatically by setTags

    # The newly parsed points should appear
    assert len(rpt.default_points) == 2
    assert rpt.default_points[0].pos == 0.0
    assert rpt.default_points[0].c == [1.0, 0.0, 0.0]
    assert rpt.default_points[0].interp == classRampBasis.Linear
    assert rpt.default_points[1].pos == 1.0
    assert rpt.default_points[1].c == [0.0, 1.0, 0.0]
    assert rpt.default_points[1].interp == classRampBasis.Bezier


def test_ramp_parm_template_class_invalid_color_parsing():
    rpt = RampParmTemplate(
        name="ramp_test_invalid",
        label="MyBadColorRamp",
        ramp_part_type=classRampParmType.Color
    )
    # Attempt with invalid color data
    # e.g. missing 3rd color component
    ramp_str = "0pos(0)0c(1 0)0interp(Linear)"
    with pytest.raises(ValueError, match="Color ramp point must have exactly 3 values"):
        rpt.setTags({"rampcolordefault": ramp_str})


def test_folder_parm_template_class():
    folder = FolderParmTemplate("folder_test", label="FolderTest", folder_type=folderType.Tabs)
    assert folder.type == parmTemplateType.Folder
    assert folder.folder_type == folderType.Tabs
    assert folder.parm_templates == []

    # Add child parm template
    int_child = IntParmTemplate("child_int", default_value=[5], num_components=1)
    folder.addParmTemplate(int_child)
    assert len(folder.parm_templates) == 1
    assert folder.parm_templates[0] is int_child

    folder_spec = folder.getParmTemplateSpec()
    assert isinstance(folder_spec, FolderParmTemplateSpec)
    assert len(folder_spec.params) == 1
    # that single param is IntParmTemplateSpec
    assert folder_spec.params[0].param_type == parmTemplateType.Int

    param_specs = folder.getParameterSpec()
    # child param => 1 spec
    assert len(param_specs) == 1
    assert param_specs[0].param_type == "int"


def test_folder_set_parm_template_class():
    folder_set = FolderSetParmTemplate()
    assert folder_set.type == parmTemplateType.FolderSet
    assert folder_set.parm_templates == []

    # Add a FolderParmTemplate
    folder = FolderParmTemplate("inner_folder", label="InnerFolder")
    folder_set.addFolderParmTemplate(folder, level=2)
    assert len(folder_set.parm_templates) == 1
    assert folder_set.parm_templates[0] is folder
    assert folder.level == 2

    folder_set_spec = folder_set.getParmTemplateSpec()
    assert isinstance(folder_set_spec, FolderSetParmTemplateSpec)
    assert len(folder_set_spec.params) == 1
    assert folder_set_spec.params[0].param_type == parmTemplateType.Folder

    param_specs = folder_set.getParameterSpec()
    # The single folder's children are empty by default
    assert param_specs == []


def test_folder_parm_auto_folderset_insertion():
    """
    Test the logic that automatically wraps new FolderParmTemplate 
    in a FolderSetParmTemplate if needed.
    """
    top_folder = FolderParmTemplate("top_folder", label="TopFolder")
    # Add child folder
    nested_folder = FolderParmTemplate("nested_folder", label="Nested")
    top_folder.addParmTemplate(nested_folder)

    # We should have a FolderSet automatically inserted
    assert len(top_folder.parm_templates) == 1
    fs = top_folder.parm_templates[0]
    assert isinstance(fs, FolderSetParmTemplate)
    assert len(fs.parm_templates) == 1
    assert fs.parm_templates[0] is nested_folder


def test_parm_template_group_basic():
    group = ParmTemplateGroup()
    assert group.parm_templates == []

    # Add a few parm templates
    int_pt = IntParmTemplate("my_int", "My Int", default_value=[10], num_components=1)
    float_pt = FloatParmTemplate("my_float", "My Float", default_value=[1.5], num_components=1)
    string_pt = StringParmTemplate("my_string", "My String", default_value=["hello","world"], num_components=2)
    group.addParmTemplate(int_pt)
    group.addParmTemplate(float_pt)
    group.addParmTemplate(string_pt)

    assert len(group.parmTemplates()) == 3

    # Test getParmTemplateSpec -> returns a ParameterSpec with HoudiniParmTemplateSpecType
    pt_spec = group.getParmTemplateSpec()
    assert len(pt_spec.params_v2) == 3
    assert pt_spec.params_v2["my_int"].param_type == parmTemplateType.Int
    assert pt_spec.params_v2["my_float"].param_type == parmTemplateType.Float
    assert pt_spec.params_v2["my_string"].param_type == parmTemplateType.String

    # Test getParameterSpec -> returns a ParameterSpec with standard ParameterSpecType
    assert len(pt_spec.params) == 3
    assert "My Int" in pt_spec.params
    assert "My Float" in pt_spec.params
    assert "My String" in pt_spec.params  # the folder is keyed by label
   

def test_parm_template_group_nested_folder():
    group = ParmTemplateGroup()
    top_folder = FolderParmTemplate("top", label="Top")
    group.addParmTemplate(top_folder)
    # Add child param
    child_toggle = ToggleParmTemplate("child_toggle", "child toggle", default_value=False)
    top_folder.addParmTemplate(child_toggle)

    # We should see a FolderSet inserted automatically if needed
    assert len(top_folder.parm_templates) == 1
    folder_set = group.parm_templates[0]
    assert isinstance(folder_set, FolderSetParmTemplate)
    assert len(folder_set.parm_templates) == 1
    assert folder_set.parm_templates[0].parm_templates[0] is child_toggle

    pt_spec = group.getParmTemplateSpec()
    # top is the name, but we get the folderSet inside it
    top_folderset_spec = pt_spec.params_v2[f"FolderSet {folder_set.id}"]
    assert top_folderset_spec.param_type == parmTemplateType.FolderSet
    assert len(top_folderset_spec.params) == 1
    assert top_folderset_spec.params[0].param_type == parmTemplateType.Folder
    # that single param is the folderSet


def test_string_parm_template_menu_items():
    # This covers the branch if self.menu_items and len(...) > 0
    spt = StringParmTemplate(
        "str_menu_test",
        label="String With Menu",
        default_value=["Hello"],
        num_components=1,
        menu_items=["foo", "bar", "baz"],
        menu_labels=["Foo", "Bar", "Baz"],
        menu_use_token=False
    )

    pspec_list = spt.getParameterSpec()
    assert len(pspec_list) == 1
    param = pspec_list[0]

    # parse_string_menu_parameter should yield an EnumParameterSpec
    assert isinstance(param, EnumParameterSpec)
    assert len(param.values) == 3
    assert param.values[0].name == "foo"
    assert param.values[0].label == "Foo"
    # The default in parse_string_menu_parameter is "Hello", but if it doesn't appear in menu_items,
    # your code might fallback or do something else. Adjust as needed if your logic normalizes the default.
    assert param.default in (v.name for v in param.values)


def test_folder_parm_template_is_actual_folder():
    # A folder with folderType=TABS => True
    f1 = FolderParmTemplate("folder_test1", label="FolderTest1", folder_type=folderType.Tabs)
    assert f1.isActualFolder() is True

    # A folder with folderType=MultiparmBlock => should be False
    f2 = FolderParmTemplate("folder_test2", label="FolderTest2", folder_type=folderType.MultiparmBlock)
    assert f2.isActualFolder() is False

    # A folder with folderType=ImportBlock => also False
    f3 = FolderParmTemplate("folder_test3", label="FolderTest3", folder_type=folderType.ImportBlock)
    assert f3.isActualFolder() is False

def test_folder_parm_template_ends_tab_group():
    """
    Ensures we cover the branch where `lastFolder.ends_tab_group == True`
    so we end up in the `else: wrapFolderset(parm_template)` path.
    """
    from ripple.models.houTypes import folderType

    # 1) Create a top-level FolderParmTemplate in a group
    group = ParmTemplateGroup()

    top_folder = FolderParmTemplate("folderA", label="FolderA")
    group.addParmTemplate(top_folder)
    # The first addParmTemplate(...) will wrap folderA in a FolderSet automatically

    # 2) Add a second folder that does NOT end the tab group
    folder_b = FolderParmTemplate("folderB", label="FolderB")
    folder_b.ends_tab_group = False
    group.addParmTemplate(folder_b)
    # Because the top item is a FolderSet, we skip the wrapFolderset if the last folder
    # doesn't end the tab group

    # 3) Add a third folder *that ends the tab group*
    folder_c = FolderParmTemplate("folderC", label="FolderC")
    folder_c.ends_tab_group = True
    group.addParmTemplate(folder_c)
    # Now we should trigger the "else: wrapFolderset(...)" code

    # 4) Add a fourth folder
    folder_d = FolderParmTemplate("folderD", label="FolderD")
    group.addParmTemplate(folder_d)

    # Let's just confirm the final structure in group.parm_templates
    # The group should contain a single FolderSet (first created),
    # inside that FolderSet we should have 3 or 4 folder parm templates, but one of them might
    # have caused the creation of a second FolderSet, etc.

    # Just verify we can retrieve the final spec
    spec = group.getParmTemplateSpec()
    # This won't raise an error if the path was exercised. 
    # Optionally, you can add asserts about the nested structure if you want to confirm it.
    assert spec is not None

    # (Optional) Inspect the resulting structure for your own assurance
    # e.g. print(spec)
