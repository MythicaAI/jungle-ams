import parmTemplates from "./hou.parmTemplate.js";
import houBaseTypes from "./hou.baseTypes.js";

class SuperClass {
    constructor(superclass){
        this.superclass = superclass;
    }
    with(...mixins) {
        return mixins.reduce((acc, mixin) => mixin(acc), this.superclass);
    }
}



const hou = function() {
        
    function registerType(typeName, classDef) {
        LiteGraph.registerNodeType(typeName,classDef);
        return;
    }

    function extend(superclass) {
        return new SuperClass(superclass);
    }

    return {
        extend,
        registerType,
        ...parmTemplates,
        ...houBaseTypes,
    } 
}

LGraphCanvas.prototype.drawSubgraphPanel = function (ctx) {
    var subgraph = this.graph;
    var subnode = subgraph._subgraph_node;
    if (!subnode) {
        console.warn("subgraph without subnode");
        return;
    }
    var canvas_w = window.visualViewport.width
    var w = canvas_w;
    var h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.2);
    var margin = 10;
    ctx.fillStyle = "#111";
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.roundRect(0, -margin, w,  h + margin*2, [8]);
    ctx.fill();
    ctx.globalAlpha = 1;


    ctx.fillStyle = "#888";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    var title = '/ '
    this._graph_stack.forEach(sg => {if (sg._subgraph_node) title += sg._subgraph_node.title + ' / '});
    title += subnode.title;
    ctx.fillText(title, 40, 24);
    // var pos = this.mouse;

    if (this.drawButton(margin, margin, 16, 16, "<", "#333")) {
        this.closeSubgraph();
        return;
    }

}

LGraph.prototype.load = function(url, callback) {
    var that = this;

    async function loadModuleWithHou(url) {
        const module = await import(url);
        if (typeof module.default === 'function') {
            module.default(window.hou);
        } else {
            console.error(`Module ${url} does not have a default export function.`);
        }
    }

    async function loadNodeTypes(nodes) {
        let classesLoaded = new Set();

        async function collectAndLoadScripts(nodes) {
            for (let node of nodes) {
                if (node.class && !classesLoaded.has(node.class)) {
                    let modulePath = `./nodes/${node.class}.js`;
                    try {
                        await loadModuleWithHou(modulePath);
                        classesLoaded.add(node.class);
                    } catch (error) {
                        console.error(`Failed to load module ${modulePath}:`, error);
                    }
                }
                if (node.subgraph && node.subgraph.nodes) {
                    await collectAndLoadScripts(node.subgraph.nodes);
                }
            }
        }

        await collectAndLoadScripts(nodes);
    }

    // from file
    if (url.constructor === File || url.constructor === Blob) {
        var reader = new FileReader();
        reader.addEventListener('load', async function(event) {
            var data = JSON.parse(event.target.result);
            await loadNodeTypes(data.nodes);
            that.configure(data);
            if (callback) callback();
        });
        reader.readAsText(url);
        return;
    }

    // is a string, then an URL
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.send(null);
    req.onload = async function(oEvent) {
        if (req.status !== 200) {
            console.error("Error loading graph:", req.status, req.response);
            return;
        }
        var data = JSON.parse(req.response);
        await loadNodeTypes(data.nodes);
        that.configure(data);
        if (callback) callback();
    };
    req.onerror = function(err) {
        console.error("Error loading graph:", err);
    };
};




window.hou = hou();
