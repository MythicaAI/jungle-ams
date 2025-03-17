import { Meta, StoryObj } from "@storybook/react";
import { hou, ParmGroup } from 'houdini-ui';
import 'houdini-ui/houdini-ui.css';

const parmTemplates = [
    {
        "param_type": "String",
        "label": "Previous Path",
        "category_label": null,
        "constant": false,
        "name": "prev_path",
        "is_hidden": true,
        "is_label_hidden": false,
        "help": "",
        "join_with_next": false,
        "num_components": 1,
        "default_value": [
            "2"
        ],
        "string_type": "Regular",
        "file_type": "Any",
        "icon_names": [],
        "menu_items": [],
        "menu_labels": [],
        "menu_type": "normal"
    },
    {
        "param_type": "Menu",
        "label": "Visual Stage",
        "category_label": null,
        "constant": false,
        "name": "Stage",
        "is_hidden": false,
        "is_label_hidden": false,
        "help": "",
        "join_with_next": true,
        "default_value": 0,
        "menu_items": [
            "0",
            "1",
            "2",
            "3"
        ],
        "menu_labels": [
            "Base Shape",
            "Raw Noise",
            "Stylized",
            "Final"
        ],
        "menu_type": "normal",
        "store_default_value_as_string": false,
        "is_menu": false,
        "is_button_strip": false,
        "strip_uses_icons": false,
        "menu_use_token": false
    },
    {
        "param_type": "Toggle",
        "label": "Preview Mesh",
        "category_label": null,
        "constant": false,
        "name": "previewMesh",
        "is_hidden": false,
        "is_label_hidden": false,
        "help": "",
        "join_with_next": false,
        "default_value": false
    },
    {
        "param_type": "Toggle",
        "label": "Enable Collision",
        "category_label": null,
        "constant": false,
        "name": "collision",
        "is_hidden": false,
        "is_label_hidden": false,
        "help": "",
        "join_with_next": false,
        "default_value": true
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
                "label": "Base Shape",
                "category_label": null,
                "constant": false,
                "name": "folder1",
                "is_hidden": false,
                "is_label_hidden": false,
                "help": "",
                "join_with_next": false,
                "level": 1,
                "parm_templates": [
                    {
                        "param_type": "Float",
                        "label": "Vertex Density",
                        "category_label": "Base Shape",
                        "constant": false,
                        "name": "vertDensity",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            0.15
                        ],
                        "min": 0.0,
                        "max": 1.0,
                        "min_is_strict": false,
                        "max_is_strict": false
                    },
                    {
                        "param_type": "Int",
                        "label": "Smoothing Iterations",
                        "category_label": "Base Shape",
                        "constant": false,
                        "name": "smoothingiterations",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            2
                        ],
                        "min": 0,
                        "max": 10,
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
                "label": "Style",
                "category_label": null,
                "constant": false,
                "name": "folder1_1",
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
                                "label": "Base",
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
                                        "param_type": "Menu",
                                        "label": "Noise Type",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "base_noise",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "default_value": 11,
                                        "menu_items": [
                                            "value_fast",
                                            "sparse",
                                            "alligator",
                                            "perlin",
                                            "flow",
                                            "simplex",
                                            "worleyFA",
                                            "worleyFB",
                                            "mworleyFA",
                                            "mworleyFB",
                                            "cworleyFA",
                                            "cworleyFB",
                                            "pcloud",
                                            "scloud",
                                            "fscloud"
                                        ],
                                        "menu_labels": [
                                            "Fast",
                                            "Sparse Convolution",
                                            "Alligator",
                                            "Perlin",
                                            "Perlin Flow",
                                            "Simplex",
                                            "Worley Cellular F1",
                                            "Worley Cellular F2-F1",
                                            "Manhattan Cellular F1",
                                            "Manhattan Cellular F2-F1",
                                            "Chebyshev Cellular F1",
                                            "Chebyshev Cellular F2-F1",
                                            "Perlin Cloud",
                                            "Simplex Cloud",
                                            "Fast Simplex Cloud"
                                        ],
                                        "menu_type": "normal",
                                        "store_default_value_as_string": false,
                                        "is_menu": false,
                                        "is_button_strip": false,
                                        "strip_uses_icons": false,
                                        "menu_use_token": false
                                    },
                                    {
                                        "param_type": "Separator",
                                        "label": "",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "sepparm2",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Min Value",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "base_rangemin",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            0.0
                                        ],
                                        "min": -10.0,
                                        "max": 10.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Max Value",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "base_rangemax",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            6.36
                                        ],
                                        "min": -10.0,
                                        "max": 10.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Ramp",
                                        "label": "Ramp",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "base_ramp",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "ramp_parm_type": "Float",
                                        "default_value": 2,
                                        "default_basis": null,
                                        "color_type": null,
                                        "default_points": [
                                            {
                                                "pos": 0.0,
                                                "c": null,
                                                "value": 0.0,
                                                "interp": "Linear"
                                            },
                                            {
                                                "pos": 1.0,
                                                "c": null,
                                                "value": 1.0,
                                                "interp": "Linear"
                                            }
                                        ]
                                    },
                                    {
                                        "param_type": "Separator",
                                        "label": "",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "sepparm",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Element Size",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "base_size",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            7.31
                                        ],
                                        "min": 0.0,
                                        "max": 10.0,
                                        "min_is_strict": true,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Element Scale",
                                        "category_label": "Base",
                                        "constant": false,
                                        "name": "base_scale",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 3,
                                        "default_value": [
                                            1.0,
                                            6.6,
                                            1.0
                                        ],
                                        "min": 0.0,
                                        "max": 10.0,
                                        "min_is_strict": true,
                                        "max_is_strict": false
                                    }
                                ],
                                "folder_type": "Tabs",
                                "default_value": 0,
                                "ends_tab_group": false
                            },
                            {
                                "param_type": "Folder",
                                "label": "Mid",
                                "category_label": null,
                                "constant": false,
                                "name": "folder0_1",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Float",
                                        "label": "Blend",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_blend",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            0.522
                                        ],
                                        "min": 0.0,
                                        "max": 1.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Ramp",
                                        "label": "Mid Area",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_areaRamp",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "ramp_parm_type": "Float",
                                        "default_value": 4,
                                        "default_basis": null,
                                        "color_type": null,
                                        "default_points": [
                                            {
                                                "pos": 0.0,
                                                "c": null,
                                                "value": 0.0,
                                                "interp": "MonotoneCubic"
                                            },
                                            {
                                                "pos": 0.6022380590438843,
                                                "c": null,
                                                "value": 1.0,
                                                "interp": "MonotoneCubic"
                                            },
                                            {
                                                "pos": 0.6836215853691101,
                                                "c": null,
                                                "value": 1.0,
                                                "interp": "MonotoneCubic"
                                            },
                                            {
                                                "pos": 1.0,
                                                "c": null,
                                                "value": 0.0,
                                                "interp": "MonotoneCubic"
                                            }
                                        ]
                                    },
                                    {
                                        "param_type": "Menu",
                                        "label": "Noise Type",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_noise",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "default_value": 11,
                                        "menu_items": [
                                            "value_fast",
                                            "sparse",
                                            "alligator",
                                            "perlin",
                                            "flow",
                                            "simplex",
                                            "worleyFA",
                                            "worleyFB",
                                            "mworleyFA",
                                            "mworleyFB",
                                            "cworleyFA",
                                            "cworleyFB",
                                            "pcloud",
                                            "scloud",
                                            "fscloud"
                                        ],
                                        "menu_labels": [
                                            "Fast",
                                            "Sparse Convolution",
                                            "Alligator",
                                            "Perlin",
                                            "Perlin Flow",
                                            "Simplex",
                                            "Worley Cellular F1",
                                            "Worley Cellular F2-F1",
                                            "Manhattan Cellular F1",
                                            "Manhattan Cellular F2-F1",
                                            "Chebyshev Cellular F1",
                                            "Chebyshev Cellular F2-F1",
                                            "Perlin Cloud",
                                            "Simplex Cloud",
                                            "Fast Simplex Cloud"
                                        ],
                                        "menu_type": "normal",
                                        "store_default_value_as_string": false,
                                        "is_menu": false,
                                        "is_button_strip": false,
                                        "strip_uses_icons": false,
                                        "menu_use_token": false
                                    },
                                    {
                                        "param_type": "Separator",
                                        "label": "",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "sepparm3",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Min Value",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_rangemin",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            -1.0
                                        ],
                                        "min": -10.0,
                                        "max": 10.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Max Value",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_rangemax",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            0.2
                                        ],
                                        "min": -10.0,
                                        "max": 10.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Ramp",
                                        "label": "Ramp",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_ramp",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "ramp_parm_type": "Float",
                                        "default_value": 2,
                                        "default_basis": null,
                                        "color_type": null,
                                        "default_points": [
                                            {
                                                "pos": 0.5240274667739868,
                                                "c": null,
                                                "value": 0.0,
                                                "interp": "Linear"
                                            },
                                            {
                                                "pos": 0.6636155843734741,
                                                "c": null,
                                                "value": 1.0,
                                                "interp": "Linear"
                                            }
                                        ]
                                    },
                                    {
                                        "param_type": "Separator",
                                        "label": "",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "sepparm4",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Element Size",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_size",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            5.7
                                        ],
                                        "min": 0.0,
                                        "max": 10.0,
                                        "min_is_strict": true,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Element Scale",
                                        "category_label": "Mid",
                                        "constant": false,
                                        "name": "mid_scale",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 3,
                                        "default_value": [
                                            4.0,
                                            0.5,
                                            4.0
                                        ],
                                        "min": 0.0,
                                        "max": 10.0,
                                        "min_is_strict": true,
                                        "max_is_strict": false
                                    }
                                ],
                                "folder_type": "Tabs",
                                "default_value": 0,
                                "ends_tab_group": false
                            },
                            {
                                "param_type": "Folder",
                                "label": "Top",
                                "category_label": null,
                                "constant": false,
                                "name": "folder0_2",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Float",
                                        "label": "Blend",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "top_blend",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            0.446
                                        ],
                                        "min": 0.0,
                                        "max": 1.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Menu",
                                        "label": "Noise Type",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "top_noise",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "default_value": 11,
                                        "menu_items": [
                                            "value_fast",
                                            "sparse",
                                            "alligator",
                                            "perlin",
                                            "flow",
                                            "simplex",
                                            "worleyFA",
                                            "worleyFB",
                                            "mworleyFA",
                                            "mworleyFB",
                                            "cworleyFA",
                                            "cworleyFB",
                                            "pcloud",
                                            "scloud",
                                            "fscloud"
                                        ],
                                        "menu_labels": [
                                            "Fast",
                                            "Sparse Convolution",
                                            "Alligator",
                                            "Perlin",
                                            "Perlin Flow",
                                            "Simplex",
                                            "Worley Cellular F1",
                                            "Worley Cellular F2-F1",
                                            "Manhattan Cellular F1",
                                            "Manhattan Cellular F2-F1",
                                            "Chebyshev Cellular F1",
                                            "Chebyshev Cellular F2-F1",
                                            "Perlin Cloud",
                                            "Simplex Cloud",
                                            "Fast Simplex Cloud"
                                        ],
                                        "menu_type": "normal",
                                        "store_default_value_as_string": false,
                                        "is_menu": false,
                                        "is_button_strip": false,
                                        "strip_uses_icons": false,
                                        "menu_use_token": false
                                    },
                                    {
                                        "param_type": "Separator",
                                        "label": "",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "sepparm5",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Min Value",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "top_rangemin",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            0.0
                                        ],
                                        "min": -10.0,
                                        "max": 10.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Max Value",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "top_rangemax",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            1.36
                                        ],
                                        "min": -10.0,
                                        "max": 10.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Ramp",
                                        "label": "Ramp",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "top_ramp",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "ramp_parm_type": "Float",
                                        "default_value": 2,
                                        "default_basis": null,
                                        "color_type": null,
                                        "default_points": [
                                            {
                                                "pos": 0.0,
                                                "c": null,
                                                "value": 0.0,
                                                "interp": "Linear"
                                            },
                                            {
                                                "pos": 0.34648188948631287,
                                                "c": null,
                                                "value": 1.0,
                                                "interp": "Linear"
                                            }
                                        ]
                                    },
                                    {
                                        "param_type": "Separator",
                                        "label": "",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "sepparm6",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Element Size",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "top_size",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            10.0
                                        ],
                                        "min": 0.0,
                                        "max": 10.0,
                                        "min_is_strict": true,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Float",
                                        "label": "Element Scale",
                                        "category_label": "Top",
                                        "constant": false,
                                        "name": "top_scale",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 3,
                                        "default_value": [
                                            1.0,
                                            2.0,
                                            1.0
                                        ],
                                        "min": 0.0,
                                        "max": 10.0,
                                        "min_is_strict": true,
                                        "max_is_strict": false
                                    }
                                ],
                                "folder_type": "Tabs",
                                "default_value": 0,
                                "ends_tab_group": false
                            }
                        ]
                    },
                    {
                        "param_type": "Float",
                        "label": "Mask Angle",
                        "category_label": "Style",
                        "constant": false,
                        "name": "maxangle",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            45.0
                        ],
                        "min": 0.0,
                        "max": 90.0,
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
                "label": "Post",
                "category_label": null,
                "constant": false,
                "name": "folder1_2",
                "is_hidden": false,
                "is_label_hidden": false,
                "help": "",
                "join_with_next": false,
                "level": 1,
                "parm_templates": [
                    {
                        "param_type": "Float",
                        "label": "Post Density Reduction %",
                        "category_label": "Post",
                        "constant": false,
                        "name": "targetDensity",
                        "is_hidden": false,
                        "is_label_hidden": false,
                        "help": "",
                        "join_with_next": false,
                        "num_components": 1,
                        "default_value": [
                            50.0
                        ],
                        "min": 0.0,
                        "max": 100.0,
                        "min_is_strict": true,
                        "max_is_strict": true
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
                                "label": "Vertex Colors",
                                "category_label": null,
                                "constant": false,
                                "name": "folder3",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Menu",
                                        "label": "Channel",
                                        "category_label": "Vertex Colors",
                                        "constant": false,
                                        "name": "vertChannelPreview",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": true,
                                        "default_value": 0,
                                        "menu_items": [
                                            "0",
                                            "1",
                                            "2",
                                            "3"
                                        ],
                                        "menu_labels": [
                                            "Combined",
                                            "Red",
                                            "Green",
                                            "Blue"
                                        ],
                                        "menu_type": "normal",
                                        "store_default_value_as_string": false,
                                        "is_menu": false,
                                        "is_button_strip": false,
                                        "strip_uses_icons": false,
                                        "menu_use_token": false
                                    },
                                    {
                                        "param_type": "Toggle",
                                        "label": "Preview",
                                        "category_label": "Vertex Colors",
                                        "constant": false,
                                        "name": "vertPreview",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "default_value": false
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
                                                "label": "Combine Vertex Colors",
                                                "category_label": null,
                                                "constant": false,
                                                "name": "folder2",
                                                "is_hidden": false,
                                                "is_label_hidden": false,
                                                "help": "",
                                                "join_with_next": false,
                                                "level": 2,
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
                                                                "label": "Red Channel",
                                                                "category_label": null,
                                                                "constant": false,
                                                                "name": "redChannel",
                                                                "is_hidden": false,
                                                                "is_label_hidden": false,
                                                                "help": "",
                                                                "join_with_next": false,
                                                                "level": 2,
                                                                "parm_templates": [
                                                                    {
                                                                        "param_type": "Menu",
                                                                        "label": "Math",
                                                                        "category_label": "Red Channel",
                                                                        "constant": false,
                                                                        "name": "math_R#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": true,
                                                                        "help": "",
                                                                        "join_with_next": true,
                                                                        "default_value": 0,
                                                                        "menu_items": [
                                                                            "0",
                                                                            "1",
                                                                            "2"
                                                                        ],
                                                                        "menu_labels": [
                                                                            "Add",
                                                                            "Subtract",
                                                                            "Multiply"
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
                                                                        "label": "Mask",
                                                                        "category_label": "Red Channel",
                                                                        "constant": false,
                                                                        "name": "mask_R#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": true,
                                                                        "help": "",
                                                                        "join_with_next": true,
                                                                        "default_value": 0,
                                                                        "menu_items": [
                                                                            "0",
                                                                            "1",
                                                                            "2",
                                                                            "3"
                                                                        ],
                                                                        "menu_labels": [
                                                                            "Ao",
                                                                            "Convexity",
                                                                            "Concavity",
                                                                            "UV Seam"
                                                                        ],
                                                                        "menu_type": "normal",
                                                                        "store_default_value_as_string": false,
                                                                        "is_menu": false,
                                                                        "is_button_strip": false,
                                                                        "strip_uses_icons": false,
                                                                        "menu_use_token": false
                                                                    },
                                                                    {
                                                                        "param_type": "Float",
                                                                        "label": "Using Strength",
                                                                        "category_label": "Red Channel",
                                                                        "constant": false,
                                                                        "name": "strength_R#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": false,
                                                                        "help": "",
                                                                        "join_with_next": false,
                                                                        "num_components": 1,
                                                                        "default_value": [
                                                                            1.0
                                                                        ],
                                                                        "min": -1.0,
                                                                        "max": 1.0,
                                                                        "min_is_strict": false,
                                                                        "max_is_strict": false
                                                                    }
                                                                ],
                                                                "folder_type": "MultiparmBlock",
                                                                "default_value": 1,
                                                                "ends_tab_group": false
                                                            },
                                                            {
                                                                "param_type": "Folder",
                                                                "label": "Green Channel",
                                                                "category_label": null,
                                                                "constant": false,
                                                                "name": "greenChannel",
                                                                "is_hidden": false,
                                                                "is_label_hidden": false,
                                                                "help": "",
                                                                "join_with_next": false,
                                                                "level": 2,
                                                                "parm_templates": [
                                                                    {
                                                                        "param_type": "Menu",
                                                                        "label": "Math",
                                                                        "category_label": "Green Channel",
                                                                        "constant": false,
                                                                        "name": "math_G#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": true,
                                                                        "help": "",
                                                                        "join_with_next": true,
                                                                        "default_value": 0,
                                                                        "menu_items": [
                                                                            "0",
                                                                            "1",
                                                                            "2"
                                                                        ],
                                                                        "menu_labels": [
                                                                            "Add",
                                                                            "Subtract",
                                                                            "Multiply"
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
                                                                        "label": "Mask",
                                                                        "category_label": "Green Channel",
                                                                        "constant": false,
                                                                        "name": "mask_G#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": true,
                                                                        "help": "",
                                                                        "join_with_next": true,
                                                                        "default_value": 1,
                                                                        "menu_items": [
                                                                            "0",
                                                                            "1",
                                                                            "2",
                                                                            "3"
                                                                        ],
                                                                        "menu_labels": [
                                                                            "Ao",
                                                                            "Convexity",
                                                                            "Concavity",
                                                                            "UV Seam"
                                                                        ],
                                                                        "menu_type": "normal",
                                                                        "store_default_value_as_string": false,
                                                                        "is_menu": false,
                                                                        "is_button_strip": false,
                                                                        "strip_uses_icons": false,
                                                                        "menu_use_token": false
                                                                    },
                                                                    {
                                                                        "param_type": "Float",
                                                                        "label": "Using Strength",
                                                                        "category_label": "Green Channel",
                                                                        "constant": false,
                                                                        "name": "strength_G#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": false,
                                                                        "help": "",
                                                                        "join_with_next": false,
                                                                        "num_components": 1,
                                                                        "default_value": [
                                                                            1.0
                                                                        ],
                                                                        "min": -1.0,
                                                                        "max": 1.0,
                                                                        "min_is_strict": false,
                                                                        "max_is_strict": false
                                                                    }
                                                                ],
                                                                "folder_type": "MultiparmBlock",
                                                                "default_value": 1,
                                                                "ends_tab_group": false
                                                            },
                                                            {
                                                                "param_type": "Folder",
                                                                "label": "Blue Channel",
                                                                "category_label": null,
                                                                "constant": false,
                                                                "name": "blueChannel",
                                                                "is_hidden": false,
                                                                "is_label_hidden": false,
                                                                "help": "",
                                                                "join_with_next": false,
                                                                "level": 2,
                                                                "parm_templates": [
                                                                    {
                                                                        "param_type": "Menu",
                                                                        "label": "Math",
                                                                        "category_label": "Blue Channel",
                                                                        "constant": false,
                                                                        "name": "math_B#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": true,
                                                                        "help": "",
                                                                        "join_with_next": true,
                                                                        "default_value": 0,
                                                                        "menu_items": [
                                                                            "0",
                                                                            "1",
                                                                            "2"
                                                                        ],
                                                                        "menu_labels": [
                                                                            "Add",
                                                                            "Subtract",
                                                                            "Multiply"
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
                                                                        "label": "Mask",
                                                                        "category_label": "Blue Channel",
                                                                        "constant": false,
                                                                        "name": "mask_B#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": true,
                                                                        "help": "",
                                                                        "join_with_next": true,
                                                                        "default_value": 3,
                                                                        "menu_items": [
                                                                            "0",
                                                                            "1",
                                                                            "2",
                                                                            "3"
                                                                        ],
                                                                        "menu_labels": [
                                                                            "Ao",
                                                                            "Convexity",
                                                                            "Concavity",
                                                                            "UV Seam"
                                                                        ],
                                                                        "menu_type": "normal",
                                                                        "store_default_value_as_string": false,
                                                                        "is_menu": false,
                                                                        "is_button_strip": false,
                                                                        "strip_uses_icons": false,
                                                                        "menu_use_token": false
                                                                    },
                                                                    {
                                                                        "param_type": "Float",
                                                                        "label": "Using Strength",
                                                                        "category_label": "Blue Channel",
                                                                        "constant": false,
                                                                        "name": "strength_B#",
                                                                        "is_hidden": false,
                                                                        "is_label_hidden": false,
                                                                        "help": "",
                                                                        "join_with_next": false,
                                                                        "num_components": 1,
                                                                        "default_value": [
                                                                            1.0
                                                                        ],
                                                                        "min": -1.0,
                                                                        "max": 1.0,
                                                                        "min_is_strict": false,
                                                                        "max_is_strict": false
                                                                    }
                                                                ],
                                                                "folder_type": "MultiparmBlock",
                                                                "default_value": 1,
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
                                                "label": "AO",
                                                "category_label": null,
                                                "constant": false,
                                                "name": "folder2_1",
                                                "is_hidden": false,
                                                "is_label_hidden": false,
                                                "help": "",
                                                "join_with_next": false,
                                                "level": 2,
                                                "parm_templates": [
                                                    {
                                                        "param_type": "Int",
                                                        "label": "Number of Samples",
                                                        "category_label": "AO",
                                                        "constant": false,
                                                        "name": "aosamples",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            32
                                                        ],
                                                        "min": 1,
                                                        "max": 100,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Float",
                                                        "label": "Bias",
                                                        "category_label": "AO",
                                                        "constant": false,
                                                        "name": "aobias",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            0.1
                                                        ],
                                                        "min": 0.0,
                                                        "max": 1.0,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Int",
                                                        "label": "Blurring Iterations",
                                                        "category_label": "AO",
                                                        "constant": false,
                                                        "name": "aobluriterations",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            12
                                                        ],
                                                        "min": 0,
                                                        "max": 50,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Float",
                                                        "label": "Maximum Ray Distance",
                                                        "category_label": "AO",
                                                        "constant": false,
                                                        "name": "aomaxraydist",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            1.0
                                                        ],
                                                        "min": 0.0,
                                                        "max": 10.0,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Ramp",
                                                        "label": "Remap Range",
                                                        "category_label": "AO",
                                                        "constant": false,
                                                        "name": "aoramp",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "ramp_parm_type": "Float",
                                                        "default_value": 2,
                                                        "default_basis": null,
                                                        "color_type": null,
                                                        "default_points": [
                                                            {
                                                                "pos": 0.0,
                                                                "c": null,
                                                                "value": 0.0,
                                                                "interp": "MonotoneCubic"
                                                            },
                                                            {
                                                                "pos": 1.0,
                                                                "c": null,
                                                                "value": 1.0,
                                                                "interp": "MonotoneCubic"
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
                                                "label": "Convexity",
                                                "category_label": null,
                                                "constant": false,
                                                "name": "folder2_2",
                                                "is_hidden": false,
                                                "is_label_hidden": false,
                                                "help": "",
                                                "join_with_next": false,
                                                "level": 2,
                                                "parm_templates": [
                                                    {
                                                        "param_type": "Float",
                                                        "label": "Multiplier",
                                                        "category_label": "Convexity",
                                                        "constant": false,
                                                        "name": "convexitymult",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            10.0
                                                        ],
                                                        "min": 0.0,
                                                        "max": 10.0,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Float",
                                                        "label": "Blur Amount",
                                                        "category_label": "Convexity",
                                                        "constant": false,
                                                        "name": "convexityblur",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            55.0
                                                        ],
                                                        "min": 0.0,
                                                        "max": 100.0,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Ramp",
                                                        "label": "Remap Range",
                                                        "category_label": "Convexity",
                                                        "constant": false,
                                                        "name": "convexityramp",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "ramp_parm_type": "Float",
                                                        "default_value": 2,
                                                        "default_basis": null,
                                                        "color_type": null,
                                                        "default_points": [
                                                            {
                                                                "pos": 0.0,
                                                                "c": null,
                                                                "value": 0.0,
                                                                "interp": "MonotoneCubic"
                                                            },
                                                            {
                                                                "pos": 1.0,
                                                                "c": null,
                                                                "value": 1.0,
                                                                "interp": "MonotoneCubic"
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
                                                "label": "Concavity",
                                                "category_label": null,
                                                "constant": false,
                                                "name": "folder2_3",
                                                "is_hidden": false,
                                                "is_label_hidden": false,
                                                "help": "",
                                                "join_with_next": false,
                                                "level": 2,
                                                "parm_templates": [
                                                    {
                                                        "param_type": "Float",
                                                        "label": "Multiplier",
                                                        "category_label": "Concavity",
                                                        "constant": false,
                                                        "name": "concavitymult",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            10.0
                                                        ],
                                                        "min": 0.0,
                                                        "max": 10.0,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Float",
                                                        "label": "Blur Amount",
                                                        "category_label": "Concavity",
                                                        "constant": false,
                                                        "name": "concavityblur",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            34.22
                                                        ],
                                                        "min": 0.0,
                                                        "max": 100.0,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Ramp",
                                                        "label": "Remap Range",
                                                        "category_label": "Concavity",
                                                        "constant": false,
                                                        "name": "concavityramp",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "ramp_parm_type": "Float",
                                                        "default_value": 2,
                                                        "default_basis": null,
                                                        "color_type": null,
                                                        "default_points": [
                                                            {
                                                                "pos": 0.0,
                                                                "c": null,
                                                                "value": 0.0,
                                                                "interp": "Linear"
                                                            },
                                                            {
                                                                "pos": 1.0,
                                                                "c": null,
                                                                "value": 1.0,
                                                                "interp": "Linear"
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
                                                "label": "Uv Seams",
                                                "category_label": null,
                                                "constant": false,
                                                "name": "folder2_4",
                                                "is_hidden": false,
                                                "is_label_hidden": false,
                                                "help": "",
                                                "join_with_next": false,
                                                "level": 2,
                                                "parm_templates": [
                                                    {
                                                        "param_type": "Float",
                                                        "label": "Radius",
                                                        "category_label": "Uv Seams",
                                                        "constant": false,
                                                        "name": "uvrad",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "num_components": 1,
                                                        "default_value": [
                                                            0.5
                                                        ],
                                                        "min": 0.0,
                                                        "max": 10.0,
                                                        "min_is_strict": false,
                                                        "max_is_strict": false
                                                    },
                                                    {
                                                        "param_type": "Ramp",
                                                        "label": "Remap Range",
                                                        "category_label": "Uv Seams",
                                                        "constant": false,
                                                        "name": "uvramp",
                                                        "is_hidden": false,
                                                        "is_label_hidden": false,
                                                        "help": "",
                                                        "join_with_next": false,
                                                        "ramp_parm_type": "Float",
                                                        "default_value": 2,
                                                        "default_basis": null,
                                                        "color_type": null,
                                                        "default_points": [
                                                            {
                                                                "pos": 0.0,
                                                                "c": null,
                                                                "value": 1.0,
                                                                "interp": "MonotoneCubic"
                                                            },
                                                            {
                                                                "pos": 1.0,
                                                                "c": null,
                                                                "value": 0.0,
                                                                "interp": "MonotoneCubic"
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
                                ],
                                "folder_type": "Tabs",
                                "default_value": 0,
                                "ends_tab_group": false
                            },
                            {
                                "param_type": "Folder",
                                "label": "Uvs",
                                "category_label": null,
                                "constant": false,
                                "name": "folder3_1",
                                "is_hidden": false,
                                "is_label_hidden": false,
                                "help": "",
                                "join_with_next": false,
                                "level": 2,
                                "parm_templates": [
                                    {
                                        "param_type": "Float",
                                        "label": "UV Alignment",
                                        "category_label": "Uvs",
                                        "constant": false,
                                        "name": "dir_vector",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 3,
                                        "default_value": [
                                            0.0,
                                            1.0,
                                            0.0
                                        ],
                                        "min": 0.0,
                                        "max": 1.0,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    },
                                    {
                                        "param_type": "Menu",
                                        "label": "Texture Res",
                                        "category_label": "Uvs",
                                        "constant": false,
                                        "name": "texture",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "default_value": 5,
                                        "menu_items": [
                                            "128",
                                            "256",
                                            "512",
                                            "1024",
                                            "2048",
                                            "4096"
                                        ],
                                        "menu_labels": [
                                            "128",
                                            "256",
                                            "512",
                                            "1024",
                                            "2048",
                                            "4096"
                                        ],
                                        "menu_type": "normal",
                                        "store_default_value_as_string": false,
                                        "is_menu": false,
                                        "is_button_strip": false,
                                        "strip_uses_icons": false,
                                        "menu_use_token": true
                                    },
                                    {
                                        "param_type": "Int",
                                        "label": "Pixels Per Meter",
                                        "category_label": "Uvs",
                                        "constant": false,
                                        "name": "size",
                                        "is_hidden": false,
                                        "is_label_hidden": false,
                                        "help": "",
                                        "join_with_next": false,
                                        "num_components": 1,
                                        "default_value": [
                                            128
                                        ],
                                        "min": 16,
                                        "max": 1024,
                                        "min_is_strict": false,
                                        "max_is_strict": false
                                    }
                                ],
                                "folder_type": "Tabs",
                                "default_value": 0,
                                "ends_tab_group": false
                            }
                        ]
                    }
                ],
                "folder_type": "Tabs",
                "default_value": 0,
                "ends_tab_group": false
            }
        ]
    },
    {
        "param_type": "file",
        "label": "world mesh",
        "category_label": null,
        "constant": false,
        "name": "",
        "default": ""
    },
    {
        "param_type": "file",
        "label": "rockified Mesh",
        "category_label": null,
        "constant": false,
        "name": "",
        "default": ""
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