const hou = (function() {
    /**
     * Enumeration of available script languages.
     * @enum {string}
     */
    const scriptLanguage = {
        Python: 'Python',
        Hscript: 'Hscript'
    };
    /**
     * Enumeration of parameter template types.
     * @enum {string}
     */
    const parmTemplateType = {
        Int: 'Int',
        Float: 'Float',
        String: 'String',
        Toggle: 'Toggle',
        Menu: 'Menu',
        Button: 'Button',
        FolderSet: 'FolderSet',
        Folder: 'Folder',
        Separator: 'Separator',
        Label: 'Label',
        Ramp: 'Ramp',
        Data: 'Data',
    };
    /**
     * Enumeration of parameter data types
     * @enum {string}
     */
    const parmData = {
        Int: 'Int',
        Float: 'Float',
        String: 'String',
        Ramp: 'Ramp',
    }
    /**
     * Enumeration of available looks for a parameter
     * @enum {string}
     */
    const parmLook = {
        Regular : "Regular", 
        Logarithmic : "Logarithmic",
        Angle : "Angle",
        Vector : "Vector",
        ColorSquare : "Colorsquare",
        HueCircle : "Huecircle",
        CRGBAPlaneChooser : "Crgbaplanechooser",
    }
    /**
     * Enumeration of available naming schemes for a parameter.
     * @enum {string}
     */
    const parmNamingScheme = {
        Base1: 'Base1', //"foo1", "foo2", "foo3", …
        XYZW: 'XYZW', //"foox", "fooy", "fooz", "foow"
        XYWH: 'XYWH', //"foox", "fooy", "foow", "fooh"
        UVW: 'UVW', //"foou", "foov", "foow"
        RGBA: 'RGBA', //"foor", "foog", "foob", "fooa"
        MinMax: 'MinMax', //"foomin", "foomax"
        MaxMin: 'MaxMin', //"foomax", "foomin"
        StartEnd: 'StartEnd', //"foostart", "fooend"
        BeginEnd: 'BeginEnd', //"foobegin", "fooend"
    }
    /**
     * Enumeration of available naming schemes for a paramete
      * @enum {string}
    */
    const parmCondType = {
        DisableWhen: 'DisableWhen',
        HideWhen: 'HideWhen',
        NoCookWhen: 'NoCookWhen'
    }
    /**
     * Enumeration of parameter menu types
     * @enum {string}
     */
    const menuType = {
        Normal: 'normal',
        Mini: 'mini',
        ControlNextParameter: 'controlNextParamater',
        StringReplace: 'stringReplace',
        StringToggle: 'stringToggle'
    }
    /**
     * Enumeration of string parameter types
     * @enum {string}
     */
    const stringParmType = {
        Regular: 'Regular',
        FileReference: 'FileReference',
        NodeReference: 'NodeReference',
        NodeReferenceList: 'NodeReferenceList',
    }
    /**
     * Enumeration of file types.
     * @enum {string}
    */
    const fileType = {
        Any: 'Any',
        Image: 'Image',
        Geometry: 'Geometry',
        Ramp: 'Ramp',
        Capture: 'Capture',
        Clip: 'Clip',
        Lut: 'Lut',
        Cmd: 'Cmd',
        Midi: 'Midi',
        I3d: 'I3d',
        Chan: 'Chan',
        Sim: 'Sim',
        SimData: 'SimData',
        Hip: 'Hip',
        Otl: 'Otl',
        Dae: 'Dae',
        Gallery: 'Gallery',
        Directory: 'Directory',
        Icon: 'Icon',
        Ds: 'Ds',
        Alembic: 'Alembic',
        Psd: 'Psd',
        LightRig: 'LightRig',
        Gltf: 'Gltf',
        Movie: 'Movie',
        Fbx: 'Fbx',
        Usd: 'Usd',
        Sqlite: 'Sqlite',
    }
    /**
     * Enumeration of folder types for FolderParmTemplates.
     * @enum {string}
     */
    const folderType = {
        Collapsible: 'Collapsible', // A folder that expands and collapses to show and hide its contents respectively.
        Simple: 'Simple', // A simple folder for organizing parameters in the form of a group box.
        Tabs: 'Tabs', // A normal folder represented by a tab.
        RadioButtons: 'RadioButtons', // A folder with a radio button. The open folder is the selected radio button in the set of buttons.
        MultiparmBlock: 'MultiparmBlock', //  A block of multiparms. The user can add or remove instances of this parameter block.
        ScrollingMultiparmBlock: 'ScrollingMultiparmBlock', //A multiparm block inside a smaller region with scroll bars.
        TabbedMultiparmBlock: 'TabbedMultiparmBlock', // A multiparm block where each instance of the parameters in the block appears in its own tab.
        ImportBlock: 'ImportBlock',        
    }
    /**
     * Enumeration of label parameter types.
     * @enum {string}
     */
    const labelParmType = {
        Heading: "Heading",
        Label: "Label",
        Message: "Message"
    }
    /**
     * Enumeration of data parameter types.
     * @enum {string}
     */
    const dataParmType = {
        Geometry: "Geometry",
        KeyValueDictionary: "KeyValueDictionary",
    }
    /**
     * Enumeration of ramp types.
     * @enum {string}
     */
    const rampParmType = {
        Color: 'Color',
        Float: 'Float',
    }
    /**
     * Enumeration of ramp interpolation types.
     * @enum {string}
     */
    const rampBasis = {
        Linear: 'Linear', //  Does a linear (straight line) interpolation between keys.        
        Constant: 'Constant', // Holds the value constant until the next key.
        CatmullRom: 'CatmullRom',  //  Interpolates smoothly between the keys. See Catmull-Rom_spline .
        MonotoneCubic: 'MonotoneCubic', //  Another smooth interpolation that ensures that there is no overshoot. For example, if a key’s value is smaller than the values in the adjacent keys, this type ensures that the interpolated value is never less than the key’s value.
        Bezier: 'Bezier', //  Cubic Bezier curve that interpolates every third control point and uses the other points to shape the curve. See Bezier curve .
        BSpline: 'BSpline', //  Cubic curve where the control points influence the shape of the curve locally (that is, they influence only a section of the curve). See B-Spline .
        Hermite: 'Hermite', //  Cubic Hermite curve that interpolates the odd control points, while even control points control the tangent at the previous interpolation point. See Hermite spline .        
    }
    /** 
     * Enumeration of color spaces
     * @enum {string}
     */
    const colorType = {
        RGB: 'RGB',
        HSV: 'HSV',
        HSL: 'HSL',
        LAB: 'LAB',
        XYZ: 'XYZ',
    }

    
    class _ParmTemplate {
        
        dims = {
            width: 300,
            height: LiteGraph.NODE_WIDGET_HEIGHT,
            font: 12
        }

        widgets = [];

        widgetFactory = () => ({
            type: "label",
            name: this.label,
            values: "WIDGET PLACEHODER",
            callback: ()=>{},
            options: {
                property: this.name,
            }
        })
        

        getWidgets()  {
            if (this.widgets.length == 0) {
                const template = this.widgetFactory();
    
                if (!this.num_components) this.num_components =1;
    
                if (this.num_components>1) {
                    let appx;
                    let def;
                    for (let i=0;i<= this.num_components-1;i++) {
                        appx = this.naming_scheme.charAt(i);
                        if (template.type === 'text')
                            def = (this.default_value.length == 0 ? "" : this.default_value[i])
                        else
                            def = (this.default_value.length == 0 ? 0 : this.default_value[i])
                        
                        this.widgets.push(Object.assign({}, template,{
                            name: this.label + appx,
                            value: def,
                            callback: (val)=> this.node.properties[this.name][i] = val,
                        }));           
                    }
                }else {
                    this.widgets.push(Object.assign({}, template,{
                        name: this.label,
                        value: this.default_value,
                        callback: (val)=> this.node.properties[this.name] = val,
                    }));
                }

            }
            return this.widgets;
        } 
                
        linkNode(node) {
            if (this._needsDefaultPropertyValue(node,this.name))
                node.properties[this.name]=this.defaultValue;
            this.node = node;            
        }

        _needsDefaultPropertyValue(node,key) {
            if ("properties" in node) {
                if (!key in node.properties || node.properties[key] == undefined) {
                    return true;
                }
            }
            return false;
        };


        bindMethods = () => {
            // Automatically bind all methods to the instance
            Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => typeof this[prop] === 'function')
            .forEach(method => {
                this[method] = this[method].bind(this);
            });
        }

        hide(on, shallow) {
            this.is_ui_hidden = on
            this.widgets.forEach( w => w.is_hidden = on)
            if (!shallow && this.parm_templates && this.parm_templates.length) {
                this.parm_templates.forEach(pt => pt.hide(on))
            } 
        }
        //methods required by the transpiler
        hideLabel(on) {this.is_label_hidden = on}
        setConditional(condType,condition) {
            if (!this.conditionals) this.conditionals = {}
            this.conditionals[condType] = condition
        }
        setHelp(help){this.help = help}
        setJoinWithNext(on){this.join_with_next=on}
        setScriptCallback(script){this.script_callback=script}
        setScriptCallbackLanguage(script_language) {this.script_callback_language=script_language}
        setTabConditional(condType,condition) {
            if (!this.tab_conditionals) this.tab_conditionals = {}
            this.tab_conditionals[condType] = condition
        }
        setTags(tags) {this.tags = tags}
    }

    class SeparatorParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {boolean} config.is_hidden
         * @param {Object} config.tags
         */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Separator,
                name: "separator",
                is_hidden: false,
                tags: {}
            }, config);
            this.bindMethods();
        }
        
        widgetFactory = () => ({
            type: "separator",
            name: "",
            values: '',
            options: {}, 
            draw: (ctx, node, width, y, H) => {
                let margin=15
                ctx.fillStyle = "#222" 
                const fill = {x: margin, y: y+H/2, len:width - margin * 2, height: 1}
                ctx.fillRect(fill.x,fill.y,fill.len,fill.height );
                
            }
        })
        
    }
    class ButtonParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name 
         * @param {string} config.label 
         * @param {string} config.disable_when
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
        */
        constructor(config) {
            super();
            Object.assign(this,{
                type : hou.parmTemplateType.Button,
                name :  "button",
                label :  "Button",
                disable_when :  null,
                is_hidden :  false,
                is_label_hidden :  false,
                join_with_next :  false,
                help :  null,
                script_callback :  null,
                script_callback_language :  null,
                tags :  {}
            }, config);
            this.bindMethods();
        }
        
        widgetFactory = function() {
            return {
                type: "button",
                name: this.label,
                values: null,
                computeSize: () => [this.dims.width/3, this.dims.height], 
                callback: null, 
            }
        }        
    }
    class FloatParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {number} config.num_components
         * @param {Array<number>} config.default_value
         * @param {number} config.min
         * @param {number} config.max
         * @param {number} config.min_is_strict
         * @param {number} config.max_is_strict
         * @param {parmLook} config.look
         * @param {parmNamingScheme} config.naming_scheme
         * @param {string} config.disable_when
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
         * @param {Array<string>} config.default_expression
         * @param {Array<scriptLanguage>} config.default_expression_language
        */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Float,
                name: "float",
                label: "Float",
                num_components: 1,
                default_value: [],
                min: 0.0,
                max: 10.0,
                min_is_strict: false,
                max_is_strict: false,
                look: parmLook.Regular,
                naming_scheme: parmNamingScheme.XYZW,
                disable_when: null,
                is_hidden: false,
                is_label_hidden: false,
                join_with_next: false,
                help: null,
                script_callback: null,
                script_callback_language: scriptLanguage.Hscript,
                tags: {},
                default_expression: [],
                default_expression_language: [] 
            }, config);
            this.bindMethods(); 
        }

        widgetFactory = () => ({
            type: "number",
            name: this.label,
            values: this.defaultValue, 
            callback: ()=>{}, 
            options: {
                property: this.name,
                min: this.min,
                max: this.max,
                precision:3,
                step: (this.max - this.min) / 10
            } 
        })
    }
    class IntParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {number} config.num_components
         * @param {Array<number>} config.default_value
         * @param {number} config.min
         * @param {number} config.max
         * @param {number} config.min_is_strict
         * @param {number} config.max_is_strict
         * @param {parmLook} config.look
         * @param {parmNamingScheme} config.naming_scheme
         * @param {Array<string>} config.menu_items
         * @param {Array<string>} config.menu_labels
         * @param {Array<string>} config.icon_names
         * @param {string} config.item_generator_script
         * @param {scriptLanguage} config.item_generator_script_language
         * @param {menuType} config.menu_type
         * @param {string} config.disable_when
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
         * @param {Array<string>} config.default_expression
         * @param {Array<scriptLanguage>} config.default_expression_language
        */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Int,
                name: "int",
                label: "Int",
                num_components: 1,
                default_value: [],
                min: 0,
                max: 10,
                min_is_strict: false,
                max_is_strict: false,
                look: parmLook.Regular,
                naming_scheme: parmNamingScheme.XYZW,
                menu_items: [],
                menu_labels: [],
                icon_names: [],
                item_generator_script: null,
                item_generator_script_language: null,
                menu_type: menuType.Normal,
                disable_when: null,
                is_hidden: false,
                is_label_hidden: false,
                join_with_next: false,
                help: null,
                script_callback: null,
                script_callback_language: scriptLanguage.Hscript,
                tags: {},
                default_expression: [],
                default_expression_language: [] 
            },config);
            this.bindMethods();
        };

        widgetFactory = () => ({
            type: "number",
            name: this.label,
            values: this.defaultValue, 
            callback: ()=>{}, 
            options: {
                property: this.name,
                min: this.min,
                max: this.max,
                precision:0,
                step: 1
            } 
        })
    }
    class StringParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {number} config.num_components
         * @param {Array<string>} config.default_value
         * @param {parmNamingScheme} config.naming_scheme
         * @param {stringParmType} config.string_type 
         * @param {fileType} config.file_type 
         * @param {Array<string>} config.menu_items
         * @param {Array<string>} config.menu_labels
         * @param {Array<string>} config.icon_names
         * @param {string} config.item_generator_script
         * @param {scriptLanguage} config.item_generator_script_language
         * @param {menuType} config.menu_type
         * @param {string} config.disable_when
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
         * @param {Array<string>} config.default_expression
         * @param {Array<scriptLanguage>} config.default_expression_language
        */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.String,
                name: "string",
                label: "String",
                num_components: 1,
                default_value: [],
                naming_scheme: parmNamingScheme.Base1,
                string_type: stringParmType.Regular,
                file_type: fileType.Any, 
                menu_items: [],
                menu_labels: [],
                icon_names: [],
                item_generator_script: null,
                item_generator_script_language: null,
                menu_type: menuType.Normal,
                disable_when: null,
                is_hidden: false,
                is_label_hidden: false,
                join_with_next: false,
                help: null,
                script_callback: null,
                script_callback_language: scriptLanguage.Hscript,
                tags: {},
                default_expression: [],
                default_expression_language: [] 
            },config);
            this.bindMethods();
        }   
        
        //template this so it can be copied above
        widgetFactory = () => ({
            type: "text",
            name: this.label,
            values: this.defaultValue, 
            callback: ()=>{}, 
            options: {
                property: this.name
            } 
        })
    }
    class ToggleParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {boolean} config.default_value
         * @param {string} config.disable_when
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
         * @param {Array<string>} config.default_expression
         * @param {Array<scriptLanguage>} config.default_expression_language
         */

        constructor(config){
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Toggle,
                name: "toggle",
                label: "Toggle",
                default_value: false,
                disable_when: null,
                is_hidden: false,
                is_label_hidden: false,
                join_with_next: false,
                help: null,
                script_callback: null,
                script_callback_language: scriptLanguage.Hscript,
                tags: {},
                default_expression: "",
                default_expression_language: scriptLanguage.Hscript 
            }, config);
            this.bindMethods();
        }


        widgetFactory = () => ({
            type: "toggle",
            name: this.label,
            values: this.default_value, 
            callback: null, 
            options: { 
                property: this.name
            } 
        })            
    }
    class MenuParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {Array<string>} config.menu_items
         * @param {Array<string>} config.menu_labels
         * @param {number} config.default_value
         * @param {Array<string>} config.icon_names
         * @param {string} config.item_generator_script
         * @param {scriptLanguage} config.item_generator_script_language
         * @param {string} config.disable_when
         * @param {menuType} config.menu_type
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
         * @param {Array<string>} config.default_expression
         * @param {Array<scriptLanguage>} config.default_expression_language
         * @param {boolean} config.store_default_value_as_string
         * @param {boolean} config.is_menu
         * @param {boolean} config.is_button_strip
         * @param {boolean} config.strip_uses_icons

        */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Menu,
                name: "menu",
                label: "Menu",
                menu_items: [],
                menu_labels: [],
                default_value: null,
                icon_names: [],
                item_generator_script: '',
                item_generator_script_language: null,
                disable_when: null,
                menu_type: menuType.Normal,
                is_hidden: false,
                is_label_hidden: false,
                join_with_next: false,
                help: null,
                script_callback: null,
                script_callback_language: scriptLanguage.Hscript,
                tags: {},
                default_expression: "",
                default_expression_language: scriptLanguage.Hscript,
                store_default_value_as_string: false,
                is_menu: false,
                is_button_strip: false,
                strip_uses_icons: false
            },config);
            this.bindMethods();
        }   

        widgetFactory = () => ({
            type: "combo",
            name: this.label,
            values: this.menu_labels[this.default_value],
            options: { 
                values:this.menu_labels,
                property: this.name
            } 
        })
    }
    class LabelParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {Array<string>} config.column_labels
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {Object} config.tags
         */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Label,
                name: "label",
                label: "Label",
                column_labels: [],
                is_hidden: false,
                is_label_hidden: false,
                join_with_next: false,
                help: null,
                tags: {},
            },config);
            this.bindMethods();
        }   
        widgetFactory = () => ({
            type: "label",
            name: this.label,
            values: null,
            callback: ()=>{},
            options: {}
        })
    }
    class RampParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {number} config.default_value
         * @param {rampBasis} config.default_basis,
         * @param {boolean} config.show_controls
         * @param {colorType} config.color_type
         * @param {string} config.disable_when
         * @param {boolean} config.is_hidden
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
         * @param {Array<scriptLanguage>} config.default_expression_language
        */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Ramp,
                name: "ramp",
                label: "Ramp",
                default_value: 2,
                default_basis: null,
                show_controls: true,
                color_type: null,
                disable_when: null,
                is_hidden: false,
                help: null,
                script_callback: null,
                script_callback_language: scriptLanguage.Hscript,
                tags: {},
                default_expression_language: scriptLanguage.Hscript,
            },config);
            if (!this.defaultValue || this.defaultValue < 2) 
                this.defaultValue = 2
            this.bindMethods();
        }   
        #generateCoordinates(n) {
            if (n <= 1) {
                return [{ x: 0, y: 0 }];
            }
        
            const coordinates = [];
            for (let i = 0; i < n; i++) {
                const value = i / (n - 1);
                coordinates.push({ x: value, y: value });
            }            
            return coordinates;
        }
        
        linkNode(node) {
            if (this._needsDefaultPropertyValue(node,this.name))
                node.properties[this.name]=this.#generateCoordinates(this.defaultValue);
            this.node = node;            
        }

        widgetFactory = () => ({
            type: "ramp",
            name: this.label,
            values: '',
            computeSize: () => [this.dims.width, this.dims.height * 4],
            mouse: ()=>{
                console.log(`Ramp Parm Clicked ${this.label}`)
            },
            options: {
                height: 15,
            },
            draw: (ctx, node, width, y, H) => {
                
                let height = this.dims.height * 3;
                let margin = 15;
                
                let text_color= "#CCC"
                ctx.fillStyle = "#444" 
                ctx.strokeStyle = "#666";
                ctx.fillRect(margin, y+H, width - margin * 2, height);
                ctx.strokeRect(margin, y+H, width - margin * 2, height);
                ctx.textAlign = "left";
                ctx.fillStyle = text_color;
                ctx.fillText(`RAMP: ${this.label}`, margin, y + H * 0.7);

                let points = node.properties[this.name]

                // Begin path for line drawing
                ctx.beginPath();

                for (let i = 0; i < points.length; i++) {
                    // Scale the x and y to fit the canvas dimensions
                    let x1 = points[i].x * (width - 2 * margin) + margin;  // Scaled x plus a margin
                    let y1 = y + H + height - (points[i].y * height);  // Scaled y plus a margin and inverted

                    if (i === 0) {
                        ctx.moveTo(x1, y1);  // Move to the first point without drawing a line
                    } else {
                        ctx.lineTo(x1, y1);  // Draw line to subsequent points
                    }
                }

                // Style settings for the line
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#007bff';
                ctx.stroke();  // Draw the line through the points

                // Begin path for filling
                ctx.beginPath();
                ctx.moveTo(points[0].x * (width - 2 * margin) + margin, y + H + height);  // Start from the bottom left

                for (let i = 0; i < points.length; i++) {
                    // Scale the x and y to fit the canvas dimensions
                    let x1 = points[i].x * (width - 2 * margin) + margin;  // Scaled x plus a margin
                    let y1 = y + H + height - (points[i].y * height);  // Scaled y plus a margin and inverted

                    ctx.lineTo(x1, y1);  // Draw line to subsequent points
                }

                // Draw the last line down to the x-axis
                ctx.lineTo(points[points.length - 1].x * (width - 2 * margin) + margin, y + H + height);

                // Close the path to the starting point
                ctx.closePath();

                // Fill the area
                ctx.fillStyle = 'rgba(0, 123, 255, 0.2)';  // Set fill color with some transparency
                ctx.fill();  // Fill the area under the line

                // Optionally draw circles at points without filling them
                ctx.beginPath();
                for (let i = 0; i < points.length; i++) {
                    let x1 = points[i].x * (width - 2 * margin) + margin;  // Scaled x plus a margin
                    let y1 = y + H + height - (points[i].y * height);  // Scaled y plus a margin and inverted
                    ctx.moveTo(x1 + 5, y1);  // Move to the edge of the circle
                    ctx.arc(x1, y1, 5, 0, 2 * Math.PI);  // Draw circle at each point
                }
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#007bff';
                ctx.stroke();  // Draw the circles


            }
        })
    }
    class DataParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {number} config.num_components
         * @param {parmLook} config.look
         * @param {parmNamingScheme} config.naming_scheme
         * @param {string} config.disable_when
         * @param {boolean} config.is_hidden
         * @param {boolean} config.is_label_hidden
         * @param {boolean} config.join_with_next
         * @param {string} config.help
         * @param {string} config.script_callback
         * @param {scriptLanguage} config.script_callback_language
         * @param {Object} config.tags
         * @param {[string]} config.default_expression
         * @param {Array<scriptLanguage>} config.default_expression_language
        */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Data,
                name: "data",
                label: "Data",
                num_components: 1,
                look: parmLook.Regular,
                naming_scheme: parmNamingScheme.XYZW,
                disable_when: null,
                is_hidden: false,
                is_label_hidden: false,
                join_with_next: false,
                help: null,
                script_callback: null,
                script_callback_language: scriptLanguage.Hscript,
                tags: {},
                default_expression: [],
                default_expression_language: [] 
            },config);
            this.bindMethods();
        }               
    }
    class FolderParmTemplate extends _ParmTemplate {
        level=1;
        folder_set=null;
        is_active=false;
        

        /**
         * 
         * @param {Object} config 
         * @param {string} config.name
         * @param {string} config.label
         * @param {[_ParmTemplate]} config.parm_templates
         * @param {folderType} config.folder_type
         * @param {boolean} config.is_hidden
         * @param {boolean} config.ends_tab_group
         * @param {Object} config.tags
         * @param {Object} config.conditionals
         * @param {Object} config.tab_conditionals
        */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.Folder,
                name: "folder",
                label: "Folder",
                parm_templates: [],
                folder_type: folderType.Tabs,
                is_hidden: false,
                ends_tab_group: false,
                tags: {},
                conditionals: {},
                tab_conditionals: {} 
            },config);
            this.bindMethods();
        }

        //folder Widget Overrides
        getWidgets() {
            let firstDraw = false;

            if (this.widgets.length == 0) {
                this.widgets.push(this.widgetFactory());
                firstDraw = true;
            }

            const widgets = [...this.widgets];
            this.parm_templates.forEach(pt => widgets.push(...pt.getWidgets()));        
            if (firstDraw) this.activate(false);
            return widgets;
        }

        widgetFactory = () => ({
            type: "folder",
            name: this.label,
            value: '',
            node: null,
            mouse: (event)=>{
                if (event.type == LiteGraph.pointerevents_method+"up") {
                    event.stopPropagation();
                    this.folder_set?.setActiveFolder(this);
                    //node.setSize(node.size)
                    console.log(`active folder changed ${this.label}`)
                }                    
            },
            options: {},
            draw: (ctx, node, width, y, H) => {
                let margin=15
                let text_color= "#BBB"
                ctx.fillStyle = this.is_active? "#444" : "#555" 
                ctx.fillRect(margin, y, width - margin * 2, H);
                ctx.textAlign = "left";
                ctx.fillStyle = text_color;
                ctx.fillText(this.label, margin+(margin*this.level), y + H * 0.7);
            }                
        })

        /**
         * Append a parm template to the end of the list of parm templates inside the folder.
         */
        addParmTemplate(parm_template) {
            let prev = this.parm_templates.at(-1);
            if (parm_template instanceof hou.FolderParmTemplate) {
                if (prev instanceof hou.FolderSetParmTemplate && !prev.parm_templates.at(-1).ends_tab_group) {
                    prev.addFolderParmTemplate(parm_template, this.level+1);
                } else  {
                    let fs = new hou.FolderSetParmTemplate();
                    this.parm_templates.push(fs);
                    fs.addFolderParmTemplate(parm_template, this.level+1);
                }
            } else {
                this.parm_templates.push(parm_template);
                parm_template.hide(true);
            }
        }
        
        /**
         * Return whether or not this parm template corresponds to an actual folder, as opposed to a multiparm or import block.
         * @returns boolean
         */
        isActualFolder() {return !(this.folderType in (hou.folderType.ImportBlock, hou.folderType.MultiparmBlock))} 

        /**
         * Return the integer default value.
         * @returns {number}
         */
        defaultValue() {return this.defaultValue}

        hide(on) {
            //Overload the super method by forcing it to do deep hides and shallow shows.  
            super.hide(on,!on);

        }

        /**
         * Override superclass on folder so that the linking propagates.
         * @param {*} node 
         */
        linkNode(node) {
            this.node = node;
            this.parm_templates.forEach(pt => pt.linkNode(this.node));
        }

        activate(on) {
            this.parm_templates.forEach((pt) => {
                pt.hide(!on);
            });
            this.is_active=on
        }
    }
    class FolderSetParmTemplate extends _ParmTemplate {
        /**
         * 
         * @param {Object} config 
         * @param {[FolderParmTemplate]} config.parm_templates
         */
        constructor(config) {
            super();
            Object.assign(this,{
                type: hou.parmTemplateType.FolderSet,
                parm_templates: []
            },config);
            this.bindMethods();
        }   

        /**
         * Append a parm template to the end of the list of parm templates inside the folder.
         */
        addFolderParmTemplate(parm_template, level) {
            if (!level) level=1;
            parm_template.folder_set = this;
            parm_template.level = level;
            this.parm_templates.push(parm_template);
        }

        setActiveFolder(folder_parm_template) {
            if (this.parm_templates.length == 0)
                return; // should never happen
            
            if (folder_parm_template.is_active || this.parm_templates.length == 1) {
                folder_parm_template.activate(!folder_parm_template.is_active);
            } else {
                this.parm_templates.forEach((pt) => {
                    pt.activate(false);
                })
                folder_parm_template.activate(true);      
            }
            this.node.resetWidgets();
        }
        getWidgets() {
            const widgets = []
            this.parm_templates.forEach(pt => widgets.push(...pt.getWidgets()));        
            return widgets;
        }

        linkNode(node) {
            this.node = node;
            this.parm_templates.forEach(pt => pt.linkNode(this.node));
        }

    }

    class ParmTemplateGroup {
        
        constructor() {
            this.parm_templates=[];
        }

        getWidgets() {
            const widgets = []
            this.parm_templates.forEach(pt => widgets.push(...pt.getWidgets()));        
            return widgets;
        }

        /**
         * This method is simply an alias for the entries method.
         * @returns {[_ParmTemplate]} tuple of hou.ParmTemplate
         */
        parmTemplates() {return this.parm_templates} 
        /**
         * Return a tuple containing copies of the parm templates inside this group.
         * @returns {[_ParmTemplate]} tuple of hou.ParmTemplate
         */
        entries() {return this.parm_templates}

        /**
         * Add a parm template after all existing parm templates, outside of any folder.
         * @returns {[_ParmTemplate]} tuple of hou.ParmTemplate
         */
        append(parm_template) {this.addParmTemplate(parm_template)}

        /**
         * This method is simply an alias for the append method.
         * 
         * @param {[_ParmTemplate]} parm_template 
         */
        addParmTemplate(parm_template) {

            let prev = this.parm_templates.at(-1);
            
            if (parm_template instanceof hou.FolderParmTemplate) {
                if (prev instanceof hou.FolderSetParmTemplate 
                    && !prev.parm_templates.at(-1).ends_tab_group) {
                    prev.addFolderParmTemplate(parm_template);
                } else  {
                    let fs = new hou.FolderSetParmTemplate();
                    this.parm_templates.push(fs);
                    fs.addFolderParmTemplate(parm_template);
                }
            } else {
                this.parm_templates.push(parm_template);
            }
        }
            
        linkNode(node) {
            this.node = node;
            this.parm_templates.forEach(pt => pt.linkNode(this.node));
        }
    }


    return {
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
        _ParmTemplate,
        ParmTemplateGroup,
        ButtonParmTemplate,
        SeparatorParmTemplate,
        FloatParmTemplate,
        IntParmTemplate,
        StringParmTemplate,
        MenuParmTemplate,
        FolderParmTemplate,
        RampParmTemplate,
        SeparatorParmTemplate,
        ToggleParmTemplate,
        DataParmTemplate,
        FolderSetParmTemplate,
        LabelParmTemplate,
    };
})();

export default hou; 