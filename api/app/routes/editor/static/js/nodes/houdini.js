function HoudiniNodeFactory(nodeData) {
    const funcTitle = nodeData.title.replace(/'/g, "\\'")
    const funcName = funcTitle.replace(/[^a-zA-Z0-9_$]/g, "").replace(/^([0-9])/g,"_$1");

    const funcBody = `
        function ${funcName}() {
            this.title = '${funcName}';
            this.properties = {${Object.entries(nodeData.defaults).map(([prop, { default: defaultValue }]) => 
                `'${prop}': ${JSON.stringify(defaultValue)}`
            ).join(', ')}}

            // Adding inputs
            for (let i = 0; i < ${nodeData.inputs}; i++) {
                this.addInput('Input ' + (i + 1), "number");
            }

            // Adding outputs
            for (let i = 0; i < ${nodeData.outputs}; i++) {
                this.addOutput('Output ' + (i + 1), "number");
            }
        }
    `;
    // Create a new function with the given name and body
    //const dynamicNodeFunc = new Function(funcBody);
    //Object.defineProperty(dynamicNodeFunc, 'name', { value: nodeName });
    eval(funcBody)
    const dynamicNodeFunc = eval(funcName) 
    
    return dynamicNodeFunc;
}
/*
        // Setting up properties
        ${Object.entries(nodeData.defaults).map(([prop, { default: defaultValue }]) => `
            this.properties['${prop}'] = ${JSON.stringify(defaultValue)};
            // Add widget creation here if necessary
        `).join('')}
*/