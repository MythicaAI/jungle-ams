# darol
houdini-instruments-plugin

## Houdini Package Setup
To install the plugin:
- Copy or symlink `houdini-package/darol.json` to `$HOUDINI_USER_PREF_DIR/packages`
- Modify "DAROL" env variable to the darol-plugin clone path.
- Restart Houdini

### Shelf Tools

#### Network Exporter
Exports a houdini network as a `json` file reprensenting all nodes, a selection of nodes, or single node and optionally its subnetworks. The `json` file captures `parm` values of the nodes, as well as connections between nodes. Connections are represented as a `dict` that connect an ordered input of the node to the ordered output of its input node. 

#### Network Importer
Capable of rebuilding a network represented by the `json` exported by the tool above. Be careful importing `/obj` into a geometry. :)

### HDAs

#### Mythica > Network > Network Export
Similar to the Network Exporter Shelf tool, this HDA can be dropped into a geometry network to obverse a particular node or sub network. The `json` is written to the specified file. 

#### Mythica > Network > Node Inpspector
An inspector for a single node that outputs the nodes `parm` values as well as its input and output geometries. this HDA can be dropped into a geometry network to obverse a particular node. The `json` is written to the specified file.  

NB: The geometry export is still in progress. It does not understand outputs per frame, or input geometries yet. Significant optimization will be required to support frames. 

## Automation
Scripts for running unattended Houdini in a Houdini Docker Environment. 
