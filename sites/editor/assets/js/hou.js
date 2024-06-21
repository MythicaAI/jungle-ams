import parmTemplates from "./hou.parmTemplate.js";
import houBaseTypes from "./hou.baseTypes.js";
import houNodeTypesFactory from "./hou.nodeTypes.js";

class SuperClass {
    constructor(superclass){
        this.superclass = superclass;
    }
    with(...mixins) {
        return mixins.reduce((acc, mixin) => mixin(acc), this.superclass);
    }
}



const hou = function() {
    
    function init() {
        this.nodeTypes = houNodeTypesFactory(this);

        Object.keys(this.nodeTypes).forEach(key => {
            const nt = this.nodeTypes[key];
    
            LiteGraph.registerNodeType(nt.id,nt);
        });
    
    }
    
    function extend(superclass) {
        return new SuperClass(superclass);
    }

    return {
        init,
        extend,
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

window.hou = hou();
window.hou.init();