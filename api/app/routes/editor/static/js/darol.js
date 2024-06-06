var graph = new LGraph();

window.onload = function() {
    var canvas = document.getElementById("mythica-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var canvasNew = new LGraphCanvas("#mythica-canvas", graph);
    // Optionally, load node types
    fetch(canvas.dataset.nodesJson)
        .then(response => response.json())
        .then(data => {
            for (let nodeType in data) {
                var cnode = HoudiniNodeFactory(data[nodeType]);
                console.log("Registering " +data[nodeType].type)
                LiteGraph.registerNodeType(
                    data[nodeType].type, 
                    cnode
                );
            }
        });

    fetch(canvas.dataset.networkJson)
        .then(response => response.json())
        .then(data => {
            graph.configure(data);
        });

};


