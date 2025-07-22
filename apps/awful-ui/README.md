# Awful UI by Mythica

This is a rough POC of a graph based workflow engine for Mythica Automation. It is based on ReactFlow starter using vite + TS. It is primarily focused on gathering file based outputs from the execution of a Mythica DCC Automation script and passing those outputs to the inputs of other automations. This effectively allows us to chain automations into directed graphs and build workflows out of them. 

Future improvements: 
- passing other data structures (though those could easily be passed in `json` files using current features), 
- saving graphs as Mythica Job Defs for unattended execution.

## Quick Start

Make sure you have react and pnpm installed. From the root of `apps/awful-ui` run `pnpm install`. Then `pnpm run dev`.

## Basic Architecture 

There are three providers in the react App. 

- `MythicaApiProvider` consumes an `apikey` and provides methods to access files in the Mythica API available via the `useMythicaApi` hook. This can be extended to provide access to other APIs
- `AutomationProvider` interacts with the Mythica Automation CloudRun RESTful wrapper. (see `automation/cloudrun`) The provider queries each Automation Worker (Houdini, Blender, Genai...) for a catalog of their automations (`path=/mythica/workers`) and makes them available via the `useAutomation` hook. The provider also provides an interface to Run an automation and propage results from its execution via the `getExecutionData` method.
- `AwfulFlowProvider` provides features like "drag and drop" to add nodes to the ReactFlow canvas, and "connect" to handle passing input and output files from one node to the other. Also provides a notifier `notifyTargets` to publish execution data updates to downstream nodes.

When a drop event is triggered in the AwfulFlowProvider, a ReactFlow node is created and wrapped by the HLC corresponding to the `NodeType` of the Drop source. Currently, there are three HLC nodes: `FileUploadNode` (wraps the api endpoint `/v1/upload/store`), `FileViewerNode` (`/v1/download/{file_id}`) and `AutomationNode` (CloudRun RESTful enndpoint). 

The `AutomationNode` accepts `inputSpec` and `outputSpec` in `JSONSchema` format and renders inputs and outputs (including File connector Handles) based on those specs. The HLC, has special handling for automations with `path=/mythica/script`. The Node will present a script interface based on the Monaco Editor and interface with the `/mythica/script/interface` automation to validate the script and obtain `inputSpec` and `outputSpec` based on the script in the editor. When The script is run, the Input and Output File handles follow the specification in the script in the editor. Currently the interface refreshes after the user stops typing for a few seconds. We could/should make this a manual process instead by tying the update to a `buttonPress` event instead of the `onChange` event

## USD Viewer component

The [USD Viewer](https://github.com/coryrylan/usd-viewer) (`pnpm add usdviewer`) is an experimental component that allows rendering of `USD` and `USDZ`. It is a bit finicky as it uses a SharedBufferArray in WebAssembly to unpack the USD file and render it. Specifically, this implementation uses a custom Vite Middleware component to proxy and shorten GoogleCloudStorage URLs to conform with the requirements of the storage model in the USD. For a production push we would want to Fork and fix the upstream components in WebAssembly. 

## Vite Dev Server MiddleWare and Proxy

This POC customizes the Vite Dev server to provide proxying for CORS and USD File handling. There is a middleware component at `GET /gcs-keys${destinationURL}` that will return a plain text `gcs-key` corresponding to the URL. That key can them be used in `GET /${gcs-key}` for a proxied version of the file. A similar proxy is setup at `ANY_METHOD /mythica-api` to `https://api.mythica.ai/v1`.

