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

window.hou = hou();
window.hou.init();