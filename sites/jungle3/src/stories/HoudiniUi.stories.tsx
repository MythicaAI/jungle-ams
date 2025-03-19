import { Meta, StoryObj } from "@storybook/react";
import { hou, ParmGroup } from 'houdini-ui';
import 'houdini-ui/houdini-ui.css';

const parmTemplates = [
    {
        "param_type": "FolderSet",
        "label": "",
        "category_label": null,
        "constant": false,
        "name": "",
        "is_hidden": false,
        "is_label_hidden": false,
        "help": "",
        "join_with_next": false,
        "parm_templates": [
            {
                "param_type": "Folder",
                "label": "Folders",
                "category_label": null,
                "constant": false,
                "name": "folder_types",
                "is_hidden": false,
                "is_label_hidden": false,
                "help": "",
                "join_with_next": false,
                "level": 1,
                "parm_templates": [
                    {
                        "param_type": "FolderSet",
                        "label": "",
                        "category_label": null,
                        "constant": false,
                        "name": "",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "parm_templates": [
                            {
                                "param_type": "Folder",
                                "label": "Folder Collapse 0",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_collapse0",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Label",
                                        "label": "Label in Collapse 0",
                                        "category_label": "Folder Collapse 0",
                                        "constant": false,
                                        "name": "label",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            ""
                                        ]
                                    }
                                ],
                                "folder_type": "Collapsible",
                                "default_value": 0,
                                "ends_tab_group": false
                            },
                            {
                                "param_type": "Folder",
                                "label": "Folder Collapse 1",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_collapse1",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Label",
                                        "label": "Heading",
                                        "category_label": "Folder Collapse 1",
                                        "constant": false,
                                        "name": "labelparm",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            "Heading Label in Collapse 1"
                                        ]
                                    }
                                ],
                                "folder_type": "Collapsible",
                                "default_value": 0,
                                "ends_tab_group": false
                            }
                        ]
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Folders",
                        "constant": false,
                        "name": "sepparm13",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "FolderSet",
                        "label": "",
                        "category_label": null,
                        "constant": false,
                        "name": "",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "parm_templates": [
                            {
                                "param_type": "Folder",
                                "label": "Folder Simple",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_simple",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Label",
                                        "label": "Label in Simple Folder",
                                        "category_label": "Folder Simple",
                                        "constant": false,
                                        "name": "labelparm2",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            ""
                                        ]
                                    }
                                ],
                                "folder_type": "Simple",
                                "default_value": 0,
                                "ends_tab_group": false
                            }
                        ]
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Folders",
                        "constant": false,
                        "name": "sepparm15",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "FolderSet",
                        "label": "",
                        "category_label": null,
                        "constant": false,
                        "name": "",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "parm_templates": [
                            {
                                "param_type": "Folder",
                                "label": "Folder Radio 0",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_radio0",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Label",
                                        "label": "Message",
                                        "category_label": "Folder Radio 0",
                                        "constant": false,
                                        "name": "labelparm9",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna\naliqua. Ut enim ad minim veniam, quis nostrud exercitation\nullamco laboris nisi ut aliquip ex ea commodo consequat. \nDuis aute irure dolor in reprehenderit in voluptate velit \nesse cillum dolore eu fugiat nulla pariatur. Excepteur sint \noccaecat cupidatat non proident, sunt in culpa qui officia \ndeserunt mollit anim id est laborum."
                                        ]
                                    }
                                ],
                                "folder_type": "RadioButtons",
                                "default_value": 0,
                                "ends_tab_group": false
                            },
                            {
                                "param_type": "Folder",
                                "label": "Folder Radio 1",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_radio0_1",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Label",
                                        "label": "Message",
                                        "category_label": "Folder Radio 1",
                                        "constant": false,
                                        "name": "labelparm10",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna\naliqua. Ut enim ad minim veniam, quis nostrud exercitation\nullamco laboris nisi ut aliquip ex ea commodo consequat. \nDuis aute irure dolor in reprehenderit in voluptate velit \nesse cillum dolore eu fugiat nulla pariatur. Excepteur sint \noccaecat cupidatat non proident, sunt in culpa qui officia \ndeserunt mollit anim id est laborum."
                                        ]
                                    }
                                ],
                                "folder_type": "RadioButtons",
                                "default_value": 0,
                                "ends_tab_group": false
                            },
                            {
                                "param_type": "Folder",
                                "label": "Folder Radio 2 - Last",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_radio0_2",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Label",
                                        "label": "Message",
                                        "category_label": "Folder Radio 2 - Last",
                                        "constant": false,
                                        "name": "labelparm11",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna\naliqua. Ut enim ad minim veniam, quis nostrud exercitation\nullamco laboris nisi ut aliquip ex ea commodo consequat. \nDuis aute irure dolor in reprehenderit in voluptate velit \nesse cillum dolore eu fugiat nulla pariatur. Excepteur sint \noccaecat cupidatat non proident, sunt in culpa qui officia \ndeserunt mollit anim id est laborum."
                                        ]
                                    }
                                ],
                                "folder_type": "RadioButtons",
                                "default_value": 0,
                                "ends_tab_group": false
                            }
                        ]
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Folders",
                        "constant": false,
                        "name": "sepparm14",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "FolderSet",
                        "label": "",
                        "category_label": null,
                        "constant": false,
                        "name": "",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "parm_templates": [
                            {
                                "param_type": "Folder",
                                "label": "Folder Multi Block List",
                                "category_label": null,
                                "constant": false,
                                "name": "folder0",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Int",
                                        "label": "Int Multi Block List",
                                        "category_label": "Folder Multi Block List",
                                        "constant": false,
                                        "name": "int_multi_block_list#",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 2,
                                        "default_value": [
                                            0,
                                            0
                                        ],
                                        "min": -1,
                                        "max": 1,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    }
                                ],
                                "folder_type": "MultiparmBlock",
                                "default_value": 3,
                                "ends_tab_group": false
                            }
                        ]
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Folders",
                        "constant": false,
                        "name": "sepparm16",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "FolderSet",
                        "label": "",
                        "category_label": null,
                        "constant": false,
                        "name": "",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "parm_templates": [
                            {
                                "param_type": "Folder",
                                "label": "Folder Multi Block Scroll",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_multi_block_scroll",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Int",
                                        "label": "Int Multi Block Scroll",
                                        "category_label": "Folder Multi Block Scroll",
                                        "constant": false,
                                        "name": "int_multi_block_scroll#_2",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 2,
                                        "default_value": [
                                            0,
                                            0
                                        ],
                                        "min": -1,
                                        "max": 1,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Label",
                                        "label": "Random Label",
                                        "category_label": "Folder Multi Block Scroll",
                                        "constant": false,
                                        "name": "labelparm3_#",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            ""
                                        ]
                                    }
                                ],
                                "folder_type": "ScrollingMultiparmBlock",
                                "default_value": 3,
                                "ends_tab_group": false
                            }
                        ]
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Folders",
                        "constant": false,
                        "name": "sepparm17",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "FolderSet",
                        "label": "",
                        "category_label": null,
                        "constant": false,
                        "name": "",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "parm_templates": [
                            {
                                "param_type": "Folder",
                                "label": "Folder Multi Block Tabs",
                                "category_label": null,
                                "constant": false,
                                "name": "folder_multi_block_tabs",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Int",
                                        "label": "Int Multi Block Scroll",
                                        "category_label": "Folder Multi Block Tabs",
                                        "constant": false,
                                        "name": "int_multi_block_scroll#_3",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 2,
                                        "default_value": [
                                            0,
                                            0
                                        ],
                                        "min": -1,
                                        "max": 1,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Label",
                                        "label": "Message",
                                        "category_label": "Folder Multi Block Tabs",
                                        "constant": false,
                                        "name": "labelparm12_#",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "column_labels": [
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore magna\naliqua. Ut enim ad minim veniam, quis nostrud exercitation\nullamco laboris nisi ut aliquip ex ea commodo consequat. \nDuis aute irure dolor in reprehenderit in voluptate velit \nesse cillum dolore eu fugiat nulla pariatur. Excepteur sint \noccaecat cupidatat non proident, sunt in culpa qui officia \ndeserunt mollit anim id est laborum."
                                        ]
                                    }
                                ],
                                "folder_type": "TabbedMultiparmBlock",
                                "default_value": 3,
                                "ends_tab_group": false
                            }
                        ]
                    }
                ],
                "folder_type": "Tabs",
                "default_value": 0,
                "ends_tab_group": false
            },
            {
                "param_type": "Folder",
                "label": "Strings",
                "category_label": null,
                "constant": false,
                "name": "folder_types_1",
                "is_hidden": false,
                "is_label_hidden": false,
                "help": "",
                "join_with_next": false,
                "level": 1,
                "parm_templates": [
                    {
                        "param_type": "String",
                        "label": "String",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "string",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            ""
                        ],
                        "string_type": "Regular",
                        "file_type": "Any",
                        "icon_names": [],
                        "menu_items": [],
                        "menu_labels": [],
                        "menu_type": "normal"
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "sepparm7",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "String",
                        "label": "String File",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "string_file",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            ""
                        ],
                        "string_type": "FileReference",
                        "file_type": "Any",
                        "icon_names": [],
                        "menu_items": [],
                        "menu_labels": [],
                        "menu_type": "stringReplace"
                    },
                    {
                        "param_type": "String",
                        "label": "String File Directory",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "string_file_dir",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            ""
                        ],
                        "string_type": "FileReference",
                        "file_type": "Directory",
                        "icon_names": [],
                        "menu_items": [],
                        "menu_labels": [],
                        "menu_type": "stringReplace"
                    },
                    {
                        "param_type": "String",
                        "label": "String File Geometry",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "string_file_geometry",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            ""
                        ],
                        "string_type": "FileReference",
                        "file_type": "Geometry",
                        "icon_names": [],
                        "menu_items": [],
                        "menu_labels": [],
                        "menu_type": "stringReplace"
                    },
                    {
                        "param_type": "String",
                        "label": "String File Image",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "string_file_image",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            ""
                        ],
                        "string_type": "FileReference",
                        "file_type": "Image",
                        "icon_names": [],
                        "menu_items": [],
                        "menu_labels": [],
                        "menu_type": "stringReplace"
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "sepparm8",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "String",
                        "label": "String Operator List",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "string_op_list",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            ""
                        ],
                        "string_type": "NodeReferenceList",
                        "file_type": "Any",
                        "icon_names": [],
                        "menu_items": [],
                        "menu_labels": [],
                        "menu_type": "normal"
                    },
                    {
                        "param_type": "String",
                        "label": "Sting Operation Path",
                        "category_label": "Strings",
                        "constant": false,
                        "name": "string_op_path",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            ""
                        ],
                        "string_type": "NodeReference",
                        "file_type": "Any",
                        "icon_names": [],
                        "menu_items": [],
                        "menu_labels": [],
                        "menu_type": "normal"
                    }
                ],
                "folder_type": "Tabs",
                "default_value": 0,
                "ends_tab_group": false
            },
            {
                "param_type": "Folder",
                "label": "Ints",
                "category_label": null,
                "constant": false,
                "name": "folder_types_2",
                "is_hidden": false,
                "is_label_hidden": false,
                "help": "",
                "join_with_next": false,
                "level": 1,
                "parm_templates": [
                    {
                        "param_type": "Int",
                        "label": "Int",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "int",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            0
                        ],
                        "min": 0,
                        "max": 10,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Int",
                        "label": "Int Vector2",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "int_vector2",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 2,
                        "default_value": [
                            0,
                            0
                        ],
                        "min": -1,
                        "max": 1,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Int",
                        "label": "Int Vector3",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "int_vector3",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 3,
                        "default_value": [
                            0,
                            0,
                            0
                        ],
                        "min": -1,
                        "max": 1,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Int",
                        "label": "Int Vector4",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "int_vector4",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 4,
                        "default_value": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "min": -1,
                        "max": 1,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "sepparm5",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Int",
                        "label": "Int ColorMask",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "int_colorMask",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            15
                        ],
                        "min": 0,
                        "max": 10,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "sepparm6",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Int",
                        "label": "Int Logarithm",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "int_logarithm",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            1
                        ],
                        "min": 1,
                        "max": 1000,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Ints",
                        "constant": false,
                        "name": "sepparm9",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    }
                ],
                "folder_type": "Tabs",
                "default_value": 0,
                "ends_tab_group": false
            },
            {
                "param_type": "Folder",
                "label": "Floats",
                "category_label": null,
                "constant": false,
                "name": "folder_types_3",
                "is_hidden": false,
                "is_label_hidden": false,
                "help": "",
                "join_with_next": false,
                "level": 1,
                "parm_templates": [
                    {
                        "param_type": "Float",
                        "label": "Float",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            0.0
                        ],
                        "min": 0.0,
                        "max": 10.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector2",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector2",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 2,
                        "default_value": [
                            0.0,
                            0.0
                        ],
                        "min": -1.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector3",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector3",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 3,
                        "default_value": [
                            0.0,
                            0.0,
                            0.0
                        ],
                        "min": -1.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector4",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector4",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 4,
                        "default_value": [
                            0.0,
                            0.0,
                            0.0,
                            0.0
                        ],
                        "min": -1.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "sepparm2",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float ColorSquare",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_colorSquare",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            1.0
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector3 ColorSquare ",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector3_colorSquare",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 3,
                        "default_value": [
                            1.0,
                            1.0,
                            1.0
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector4 ColorSquare",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector4_colorSqaure",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 4,
                        "default_value": [
                            1.0,
                            1.0,
                            1.0,
                            1.0
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector4 HueCircle",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector4_hueCircle",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 4,
                        "default_value": [
                            0.0,
                            0.0,
                            0.0,
                            0.0
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "sepparm3",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Logarithm",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_logarithm",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            1.0
                        ],
                        "min": 0.01,
                        "max": 10.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "sepparm",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Angle",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_angle",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            293.9
                        ],
                        "min": 0.0,
                        "max": 360.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector 3 Direction",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector3_direction",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 3,
                        "default_value": [
                            0.0,
                            0.0,
                            0.0
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "sepparm4",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector2 UV",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector2_uv",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 2,
                        "default_value": [
                            0.0,
                            0.0
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Float",
                        "label": "Float Vector3 UVW",
                        "category_label": "Floats",
                        "constant": false,
                        "name": "float_vector3_uvw",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 3,
                        "default_value": [
                            0.0,
                            0.0,
                            0.0
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    }
                ],
                "folder_type": "Tabs",
                "default_value": 0,
                "ends_tab_group": false
            },
            {
                "param_type": "Folder",
                "label": "Miscellaneous",
                "category_label": null,
                "constant": false,
                "name": "folder_types_4",
                "is_hidden": false,
                "is_label_hidden": false,
                "help": "",
                "join_with_next": false,
                "level": 1,
                "parm_templates": [
                    {
                        "param_type": "Toggle",
                        "label": "Toggle",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "toggle",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "default_value": false
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "sepparm10",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Data",
                        "label": "Data",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "data",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1
                    },
                    {
                        "param_type": "Data",
                        "label": "Data Geometry",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "data_geometry",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1
                    },
                    {
                        "param_type": "Data",
                        "label": "Data Dictionary",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "data_dictionary",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "sepparm11",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Menu",
                        "label": "Menu Icon Strip",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "menu_iconStrip",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "default_value": 0,
                        "menu_items": [
                            "0"
                        ],
                        "menu_labels": [
                            "Option 0"
                        ],
                        "menu_type": "stringToggle",
                        "store_default_value_as_string": false,
                        "is_menu": false,
                        "is_button_strip": true,
                        "strip_uses_icons": true,
                        "menu_use_token": false
                    },
                    {
                        "param_type": "Menu",
                        "label": "Menu Ordered",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "menu_ordered",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "default_value": 1,
                        "menu_items": [
                            "1",
                            "2",
                            "3"
                        ],
                        "menu_labels": [
                            "Option 1",
                            "Option 2",
                            "Option 3"
                        ],
                        "menu_type": "normal",
                        "store_default_value_as_string": false,
                        "is_menu": false,
                        "is_button_strip": false,
                        "strip_uses_icons": false,
                        "menu_use_token": false
                    },
                    {
                        "param_type": "Menu",
                        "label": "Menu Ordered Token Val",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "menu_ordered_tokenAsVal",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "default_value": 0,
                        "menu_items": [
                            "1",
                            "2",
                            "3"
                        ],
                        "menu_labels": [
                            "Option 1",
                            "Option 2",
                            "Option 3"
                        ],
                        "menu_type": "normal",
                        "store_default_value_as_string": false,
                        "is_menu": false,
                        "is_button_strip": false,
                        "strip_uses_icons": false,
                        "menu_use_token": true
                    },
                    {
                        "param_type": "Separator",
                        "label": "",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "sepparm12",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false
                    },
                    {
                        "param_type": "Ramp",
                        "label": "Ramp Color",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "ramp_color",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "ramp_parm_type": "Color",
                        "default_value": 7,
                        "default_basis": null,
                        "color_type": null,
                        "default_points": [
                            {
                                "pos": 0.0,
                                "c": [
                                    0.0,
                                    0.0,
                                    0.0
                                ],
                                "value": null,
                                "interp": "Linear"
                            },
                            {
                                "pos": 0.16666666666666666,
                                "c": [
                                    0.16666666666666666,
                                    0.16666666666666666,
                                    0.16666666666666666
                                ],
                                "value": null,
                                "interp": "Linear"
                            },
                            {
                                "pos": 0.3333333333333333,
                                "c": [
                                    0.3333333333333333,
                                    0.3333333333333333,
                                    0.3333333333333333
                                ],
                                "value": null,
                                "interp": "Linear"
                            },
                            {
                                "pos": 0.5,
                                "c": [
                                    0.5,
                                    0.5,
                                    0.5
                                ],
                                "value": null,
                                "interp": "Linear"
                            },
                            {
                                "pos": 0.6666666666666666,
                                "c": [
                                    0.6666666666666666,
                                    0.6666666666666666,
                                    0.6666666666666666
                                ],
                                "value": null,
                                "interp": "Linear"
                            },
                            {
                                "pos": 0.8333333333333334,
                                "c": [
                                    0.8333333333333334,
                                    0.8333333333333334,
                                    0.8333333333333334
                                ],
                                "value": null,
                                "interp": "Linear"
                            },
                            {
                                "pos": 1.0,
                                "c": [
                                    1.0,
                                    1.0,
                                    1.0
                                ],
                                "value": null,
                                "interp": "Linear"
                            }
                        ]
                    },
                    {
                        "param_type": "Ramp",
                        "label": "Ramp Float",
                        "category_label": "Miscellaneous",
                        "constant": false,
                        "name": "ramp_float",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "ramp_parm_type": "Float",
                        "default_value": 7,
                        "default_basis": null,
                        "color_type": null,
                        "default_points": [
                            {
                                "pos": 0.0,
                                "c": null,
                                "value": 0.0,
                                "interp": "Constant"
                            },
                            {
                                "pos": 0.15708275139331818,
                                "c": null,
                                "value": 0.24657534062862396,
                                "interp": "Linear"
                            },
                            {
                                "pos": 0.32258063554763794,
                                "c": null,
                                "value": 0.534246563911438,
                                "interp": "CatmullRom"
                            },
                            {
                                "pos": 0.5091164112091064,
                                "c": null,
                                "value": 0.31506848335266113,
                                "interp": "MonotoneCubic"
                            },
                            {
                                "pos": 0.6591865420341492,
                                "c": null,
                                "value": 0.7260273694992065,
                                "interp": "Bezier"
                            },
                            {
                                "pos": 0.8316970467567444,
                                "c": null,
                                "value": 0.39726027846336365,
                                "interp": "BSpline"
                            },
                            {
                                "pos": 1.0,
                                "c": null,
                                "value": 0.5890411138534546,
                                "interp": "Hermite"
                            }
                        ]
                    }
                ],
                "folder_type": "Tabs",
                "default_value": 0,
                "ends_tab_group": false
            }
        ]
    }
]

const group = new hou.ParmTemplateGroup(parmTemplates);

const meta: Meta<typeof ParmGroup> = {
    title: 'Houdini UI/ParmTemplateGroup',
    component: ParmGroup,
    argTypes: {
        group: {
            control: { type: 'object' },
            defaultValue: group
        }
    }
}
export default meta;


type Story = StoryObj<typeof ParmGroup>;

export const Default: Story = {
    args: {
        group: group,
        data: {},
        onChange:()=>{}
    },
};