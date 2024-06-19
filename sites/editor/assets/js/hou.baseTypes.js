
const constructor = Symbol('constructor')

const NodeEvents = {
    onAdded: 'onAdded',
    onRemoved: 'onRemoved',
    onStart: 'onStart',
    onStop: 'onStop',
    onDrawBackground: 'onDrawBackground',
    onDrawForeground: 'onDrawForeground',
    onMouseDown: 'onMouseDown',
    onDblClick: 'onDblClick',
    onExecute: 'onExecute',
    onPropertyChanged: 'onPropertyChanged',
    onGetInputs: 'onGetInputs',
    onGetOutputs: 'onGetOutputs',
    onSerialize: 'onSerialize',
    onSelected: 'onSelected',
    onDeselected: 'onDeselected',
    onDropItem: 'onDropItem',
    onDropFile: 'onDropFile',
    onConnectInput: 'onConnectInput',
    onConnectionsChange: 'onConnectionsChange',
}

const houBaseTypes = function(){
    class _HoudiniBase  {      
        dims = {
            width: 300,
            height:  LiteGraph.NODE_WIDGET_HEIGHT,
            min_height: LiteGraph.NODE_WIDGET_HEIGHT,
            font: 12
        }
        constructor() {
            if (!this.flags) this.flags = {}
            if (!this.properties) this.properties = {}

            this.parmTemplatesInit();

            if (this.mixins) 
                this.mixins.array.forEach(mixin => {
                    if (typeof mixin.prototype[constructor] === 'function') 
                        mixin.prototype[constructor].call(this);
                });
            
            this.flags.widgets = this.parmTemplateGroup.getWidgets();
            this.flags.widgets.forEach(w => this.addCustomWidget(w))        

            this.flags.collapsed_widget = true;
            this.horizontal = true;
            this.clearWidgets();

            for (const eventType in NodeEvents)
                !this[eventType] && (this[eventType] = this.#defaultEventHandler(eventType))  
        };
        #eventHandlers = {}

        _addEventHandler(handlerType,handler){
            if (!this[handlerType]) console.warn(`Unknown Node Event: ${handlerType}`)
            this.#eventHandlers[handlerType].push(handler);
        }


        #defaultEventHandler = (eType) => ((...args) => this.#eventHandlers[eType]?.forEach(handler=>handler(args)));
        

        resetWidgets = function(){
            this.widgets = []
            this.flags.widgets.forEach((widget)=> {
                if (!widget.is_hidden) 
                    this.widgets.push(widget);
            })                                     
            this.setSize([this.dims.width,this.computeSize()[1]])
        }

        clearWidgets = function() {
            this.widgets = [];
            this.setSize([this.dims.width,this.dims.height]);
        }

        onDblClick=(e, pos, litegraph_canvas) => {
            if (pos[1] < 0) {
                this.flags.collapsed_widget = !this.flags.collapsed_widget
                if (this.flags.collapsed_widget) {
                    this.clearWidgets();
                } else {
                    this.resetWidgets();
                }
            }
            this.#defaultEventHandler('onDblClick')(e, pos, litegraph_canvas);
        }

        onDrawBackground(ctx,canvas) {
            const baseclass = this.__proto__.constructor; 
            if (baseclass.icon && !baseclass.icon_loaded) {
                baseclass.icon_image = new Image(20,20)
                baseclass.icon_image.src = baseclass.icon;  // Ensure the path is correct
                baseclass.icon_image.onload = ()=> baseclass.icon_loaded=true;
            }
            this.#defaultEventHandler('onDrawTitle')(ctx,canvas);
            
        }

        onDrawTitle(ctx) {
            const baseclass = this.__proto__.constructor; 
            if (baseclass.icon_loaded) {
                let iconX = 5;
                let iconY = 5-LiteGraph.NODE_TITLE_HEIGHT ;
                let iconWidth = 20;
                let iconHeight = 20;
    
                ctx.drawImage(baseclass.icon_image, iconX, iconY, iconWidth, iconHeight);
            }
            this.#defaultEventHandler('onDrawTitle')(ctx);

        }
        onDrawTitleBox(...args){
            this.#defaultEventHandler('onDrawTitleBox')(...args);
        }
        onDrawForeground(ctx,canvas) {
            this.flags.size = this.size;
            if (this.flags.collapsed_widget) this.clearWidgets();
            else this.resetWidgets();
            this.#defaultEventHandler('onDrawForeground')(ctx,canvas);
        }

    }
    const _SubgraphMixin = (superclass) => class extends superclass {
        [constructor]() {
            this._addEventHandler('onDblClick', function(e, pos, graphcanvas) {
                var that = this;
                setTimeout(function() {
                    graphcanvas.openSubgraph(that.subgraph);
                }, 10);
            })
        }


        onAdded = function() {
            //create inner graph
            this.subgraph = new LiteGraph.LGraph();
            this.subgraph._subgraph_node = this;
            this.subgraph._is_subgraph = true;

            this.subgraph.onTrigger = this.onSubgraphTrigger.bind(this);

            //nodes input node added inside
            this.subgraph.onInputAdded = this.onSubgraphNewInput.bind(this);
            this.subgraph.onInputRenamed = this.onSubgraphRenamedInput.bind(this);
            this.subgraph.onInputTypeChanged = this.onSubgraphTypeChangeInput.bind(this);
            this.subgraph.onInputRemoved = this.onSubgraphRemovedInput.bind(this);

            this.subgraph.onOutputAdded = this.onSubgraphNewOutput.bind(this);
            this.subgraph.onOutputRenamed = this.onSubgraphRenamedOutput.bind(this);
            this.subgraph.onOutputTypeChanged = this.onSubgraphTypeChangeOutput.bind(this);
            this.subgraph.onOutputRemoved = this.onSubgraphRemovedOutput.bind(this);

        }

        onGetInputs = function() {
            return [["enabled", "boolean"]];
        };
        
        

        
        onAction = function(action, param) {
            this.subgraph.onAction(action, param);
        };
        
        onExecute = function() {
            this.enabled = this.getInputOrProperty("enabled");
            if (!this.enabled) {
                return;
            }
        
            //send inputs to subgraph global inputs
            if (this.inputs) {
                for (var i = 0; i < this.inputs.length; i++) {
                    var input = this.inputs[i];
                    var value = this.getInputData(i);
                    this.subgraph.setInputData(input.name, value);
                }
            }
        
            //execute
            this.subgraph.runStep();
        
            //send subgraph global outputs to outputs
            if (this.outputs) {
                for (var i = 0; i < this.outputs.length; i++) {
                    var output = this.outputs[i];
                    var value = this.subgraph.getOutputData(output.name);
                    this.setOutputData(i, value);
                }
            }
        };
        
        sendEventToAllNodes = function(eventname, param, mode) {
            if (this.enabled) {
                this.subgraph.sendEventToAllNodes(eventname, param, mode);
            }
        };
        
        
        
        //**** INPUTS ***********************************
        onSubgraphTrigger = function(event, param) {
            var slot = this.findOutputSlot(event);
            if (slot != -1) {
                this.triggerSlot(slot);
            }
        };
        
        onSubgraphNewInput = function(name, type) {
            var slot = this.findInputSlot(name);
            if (slot == -1) {
                //add input to the node
                this.addInput(name, type);
            }
        };
        
        onSubgraphRenamedInput = function(oldname, name) {
            var slot = this.findInputSlot(oldname);
            if (slot == -1) {
                return;
            }
            var info = this.getInputInfo(slot);
            info.name = name;
        };
        
        onSubgraphTypeChangeInput = function(name, type) {
            var slot = this.findInputSlot(name);
            if (slot == -1) {
                return;
            }
            var info = this.getInputInfo(slot);
            info.type = type;
        };
        
        onSubgraphRemovedInput = function(name) {
            var slot = this.findInputSlot(name);
            if (slot == -1) {
                return;
            }
            this.removeInput(slot);
        };
        
        //**** OUTPUTS ***********************************
        onSubgraphNewOutput = function(name, type) {
            var slot = this.findOutputSlot(name);
            if (slot == -1) {
                this.addOutput(name, type);
            }
        };
        
        onSubgraphRenamedOutput = function(oldname, name) {
            var slot = this.findOutputSlot(oldname);
            if (slot == -1) {
                return;
            }
            var info = this.getOutputInfo(slot);
            info.name = name;
        };
        
        onSubgraphTypeChangeOutput = function(name, type) {
            var slot = this.findOutputSlot(name);
            if (slot == -1) {
                return;
            }
            var info = this.getOutputInfo(slot);
            info.type = type;
        };
        
        onSubgraphRemovedOutput = function(name) {
            var slot = this.findOutputSlot(name);
            if (slot == -1) {
                return;
            }
            this.removeOutput(slot);
        };
        // *****************************************************
        
        getExtraMenuOptions = function(graphcanvas) {
            var that = this;
            return [
                {
                    content: "Open",
                    callback: function() {
                        graphcanvas.openSubgraph(that.subgraph);
                    }
                }
            ];
        };
        
        
        
        serialize = function() {
            var data = LiteGraph.LGraphNode.prototype.serialize.call(this);
            data.subgraph = this.subgraph.serialize();
            return data;
        };
        
        reassignSubgraphUUIDs = function(graph) {
            const idMap = { nodeIDs: {}, linkIDs: {} }
        
            for (const node of graph.nodes) {
                const oldID = node.id
                const newID = LiteGraph.uuidv4()
                node.id = newID
        
                if (idMap.nodeIDs[oldID] || idMap.nodeIDs[newID]) {
                    throw new Error(`New/old node UUID wasn't unique in changed map! ${oldID} ${newID}`)
                }
        
                idMap.nodeIDs[oldID] = newID
                idMap.nodeIDs[newID] = oldID
            }
        
            for (const link of graph.links) {
                const oldID = link[0]
                const newID = LiteGraph.uuidv4();
                link[0] = newID
        
                if (idMap.linkIDs[oldID] || idMap.linkIDs[newID]) {
                    throw new Error(`New/old link UUID wasn't unique in changed map! ${oldID} ${newID}`)
                }
        
                idMap.linkIDs[oldID] = newID
                idMap.linkIDs[newID] = oldID
        
                const nodeFrom = link[1]
                const nodeTo = link[3]
        
                if (!idMap.nodeIDs[nodeFrom]) {
                    throw new Error(`Old node UUID not found in mapping! ${nodeFrom}`)
                }
        
                link[1] = idMap.nodeIDs[nodeFrom]
        
                if (!idMap.nodeIDs[nodeTo]) {
                    throw new Error(`Old node UUID not found in mapping! ${nodeTo}`)
                }
        
                link[3] = idMap.nodeIDs[nodeTo]
            }
        
            // Reconnect links
            for (const node of graph.nodes) {
                if (node.inputs) {
                    for (const input of node.inputs) {
                        if (input.link) {
                            input.link = idMap.linkIDs[input.link]
                        }
                    }
                }
                if (node.outputs) {
                    for (const output of node.outputs) {
                        if (output.links) {
                            output.links = output.links.map(l => idMap.linkIDs[l]);
                        }
                    }
                }
            }
        
            // Recurse!
            for (const node of graph.nodes) {
                if (node.type === "graph/subgraph") {
                    const merge = reassignGraphUUIDs(node.subgraph);
                    idMap.nodeIDs.assign(merge.nodeIDs)
                    idMap.linkIDs.assign(merge.linkIDs)
                }
            }
        };
        
        clone = function() {
            var node = LiteGraph.createNode(this.type);
            var data = this.serialize();
        
            if (LiteGraph.use_uuids) {
                // LGraph.serialize() seems to reuse objects in the original graph. But we
                // need to change node IDs here, so clone it first.
                const subgraph = LiteGraph.cloneObject(data.subgraph)
        
                this.reassignSubgraphUUIDs(subgraph);
        
                data.subgraph = subgraph;
            }
        
            delete data["id"];
            delete data["inputs"];
            delete data["outputs"];
            node.configure(data);
            return node;
        };
        
        buildFromNodes = function(nodes)
        {
            //clear all?
            //TODO
        
            //nodes that connect data between parent graph and subgraph
            var subgraph_inputs = [];
            var subgraph_outputs = [];
        
            //mark inner nodes
            var ids = {};
            var min_x = 0;
            var max_x = 0;
            for(var i = 0; i < nodes.length; ++i)
            {
                var node = nodes[i];
                ids[ node.id ] = node;
                min_x = Math.min( node.pos[0], min_x );
                max_x = Math.max( node.pos[0], min_x );
            }
            
            var last_input_y = 0;
            var last_output_y = 0;
        
            for(var i = 0; i < nodes.length; ++i)
            {
                var node = nodes[i];
                //check inputs
                if( node.inputs )
                    for(var j = 0; j < node.inputs.length; ++j)
                    {
                        var input = node.inputs[j];
                        if( !input || !input.link )
                            continue;
                        var link = node.graph.links[ input.link ];
                        if(!link)
                            continue;
                        if( ids[ link.origin_id ] )
                            continue;
                        //this.addInput(input.name,link.type);
                        this.subgraph.addInput(input.name,link.type);
                        /*
                        var input_node = LiteGraph.createNode("graph/input");
                        this.subgraph.add( input_node );
                        input_node.pos = [min_x - 200, last_input_y ];
                        last_input_y += 100;
                        */
                    }
        
                //check outputs
                if( node.outputs )
                    for(var j = 0; j < node.outputs.length; ++j)
                    {
                        var output = node.outputs[j];
                        if( !output || !output.links || !output.links.length )
                            continue;
                        var is_external = false;
                        for(var k = 0; k < output.links.length; ++k)
                        {
                            var link = node.graph.links[ output.links[k] ];
                            if(!link)
                                continue;
                            if( ids[ link.target_id ] )
                                continue;
                            is_external = true;
                            break;
                        }
                        if(!is_external)
                            continue;
                        //this.addOutput(output.name,output.type);
                        /*
                        var output_node = LiteGraph.createNode("graph/output");
                        this.subgraph.add( output_node );
                        output_node.pos = [max_x + 50, last_output_y ];
                        last_output_y += 100;
                        */
                    }
            }
        
            //detect inputs and outputs
                //split every connection in two data_connection nodes
                //keep track of internal connections
                //connect external connections
        
            //clone nodes inside subgraph and try to reconnect them
        
            //connect edge subgraph nodes to extarnal connections nodes
        }
        

    }
    const _MultiInputMixin = (superclass) => class extends superclass {
        [constructor]() {

        }
        
    //Special Handler fMultiInputs like SOP Merge.
        onBeforeConnectInput = function(target_slot) {
            let size = this.size;
            if (this.inputs[0].link) {
                target_slot = this.inputs.length;
                this.addInput(`Input ${target_slot}`, this.inputs[0].type, null);
            } 
            this.setSize(size);
            return target_slot;
        }

        onConnectionsChange = function(type, slot, connected, link_info, input_info) {
            let size = this.size;
            if (type ==LiteGraph.INPUT &&  !connected && slot > 0) {
                this.removeInput(slot);
                this.setSize(size);
            }
        };

        onConfigure = function(info) {
            this.multiInputNodeConstructor && this.multiInputNodeConstructor.apply(this)

        }
    }

    const types = null
    return {
        types,
        _HoudiniBase,
        _SubgraphMixin,
        _MultiInputMixin
    };
}

export default houBaseTypes();