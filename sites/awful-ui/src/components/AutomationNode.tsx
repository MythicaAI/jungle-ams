import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useUpdateNodeInternals } from '@xyflow/react';
import MonacoEditor from '@monaco-editor/react';

import useAutomation from '../hooks/useAutomation';
import useAwfulFlow from '../hooks/useAwfulFlow';
import useMythicaApi from '../hooks/useMythicaApi';

import AutomationInputs from './AutomationInputs';
import AutomationOutputs from './AutomationOutputs';

import { dictionary, ExecutionData, FileParamType } from '../types/Automation';
import { NodeState } from "../types/AwfulFlow";
import { JSONSchema } from '../types/JSONSchema';
import FileInputHandle from './Handles/FileInputHandle';
import FileOutputHandle from './Handles/FileOutputHandle';

export type AutomationExecutionData = ExecutionData & {
  output: {
    files?: {
      [key: string]: string[];
    };
    [key: string]: unknown;
  }
};
type InterfaceExecutionData = ExecutionData & {
  output: {
    workers?: { 
      [key: string]: { input?: JSONSchema, output?: JSONSchema } 
    }
    [key: string]: unknown;
  }
};

export interface AutomationNodeProps {
  id: string;
  data: {
    automation: string;
    inputData: dictionary;
    scriptContent: string;
    inputSpec: JSONSchema;
    outputSpec: JSONSchema;
    executionData: ExecutionData;
  }
}

const template = `
from pydantic import BaseModel, Field
from ripple.automation import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter
from ripple.models.streaming import ProcessStreamItem, OutputFiles
    
class RequestModel(ParameterSet):
  pass

class ResponseModel(OutputFiles):
  files: dict[str, list[str]] = Field(default={"Files": []})

def runAutomation(request: RequestModel, responder: ResultPublisher) -> ResponseModel:
  pass
`;

const AutomationNode: React.FC<AutomationNodeProps> = (node) => {
  const scriptPath = import.meta.env.VITE_AWFUL_SCRIPT_PATH;
  const scriptInterfacePath = import.meta.env.VITE_AWFUL_SCRIPT_INTERFACE_PATH;
  
  const updateNodeInternals = useUpdateNodeInternals();

  const { initAutomation, runAutomation, parseAutomation, allAutomations } = useAutomation();       //provides automation related services. 
  const automationTask = allAutomations[node.data.automation];
  const isScriptNode = automationTask.path === scriptPath;
  
  const [ myExecutionData, setMyExecutionData ] = useState<ExecutionData>(
    node.data.executionData || initAutomation(automationTask)
  );
  const [ myInterfaceData, setMyInterfaceData ] = useState<ExecutionData>(
    node.data.executionData || initAutomation(automationTask)
  );
  const { getFile } = useMythicaApi();

  const { NodeResizer, getFlowData, setFlowData } = useAwfulFlow();   //node data mapped to connections
  const myFlowData = getFlowData(node.id);
  const [flowExecutionMessage, setFlowExecutionMessage] = useState<string>('');

  //Input and Outputs Interface specs in JSONSpec (script Nodes are set later)
  const [inputSpec, setInputSpec] = useState(!isScriptNode ? automationTask.spec.input : node.data.inputSpec || { title: 'Empty', type: 'string' });
  const [outputSpec, setOutputSpec] = useState(!isScriptNode ? automationTask.spec.output : node.data.outputSpec || { title: 'Empty', type: 'string' });

  //Input File parameters detected by AutomationInputs and type (array or scalar)
  const [inputFileKeys, setInputFileKeys] = useState<Record<string, FileParamType>>({}); 
  //Output File parameters detected by AutomationOutputs
  const [outputFileKeys, setOutputFileKeys] = useState<Set<string>>(new Set()); // Store file_id parameters
  
  //Input (form) data from AutomationInputs component
  const [inputData, setInputData] = useState<dictionary>(node.data.inputData);
  //FileParameter  Inputs are handled separately based on flowData
  const [fileInputData, setFileInputData] = useState<dictionary>({});

  const [scriptContent, setScriptContent] = useState<string>(node.data.scriptContent); // State to store Monaco editor content
 
  const timeout = 2000;
  const typingTimeout = useRef(timeout);

  // Handler for FileParameter inputs detected by AutomationInputs
  const handleFileParameterDetected = useCallback((inputFileKeys: Record<string, FileParamType>) => {
    setInputFileKeys(inputFileKeys);
    updateNodeInternals(node.id);
  }, [updateNodeInternals, node.id]);

  // Handler for FileOutput keys detected by AutomationOutputs
  const handleFileOutputDetected = useCallback((fileOutputKeys: Set<string>) => {
    setOutputFileKeys(fileOutputKeys);
    updateNodeInternals(node.id);
  }, [updateNodeInternals, node.id]);

  // Handler for running the automation
  const handleRunAutomation = () => {
    if (isScriptNode) {
      runAutomation(
        automationTask.worker, 
        node.id,
        automationTask.path, 
        { 
          script: scriptContent, 
          request_data: { ...inputData, ...fileInputData } 
        },
        setMyExecutionData
        );
    } else {
      runAutomation(
        automationTask.worker,
        node.id, 
        automationTask.path, 
        { ...inputData, ...fileInputData },
        setMyExecutionData
      );
    }
  };

  // Handler for Monaco editor changes
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    setScriptContent(value || '');
    typingTimeout.current = setTimeout(() => {
      runAutomation(
        automationTask.worker, 
        node.id, 
        scriptInterfacePath, 
        { 'script': value || '' },
        setMyInterfaceData      
      );
    }, timeout); // Adjust delay as needed
  }, [runAutomation, automationTask.worker, node.id, scriptInterfacePath]);

  /**
   * Update fileInputs with the resolved file_id values
   * when the flowData changes.
   * This is necessary to ensure that the fileInputs
   *  are up-to-date with the latest file_id values.
   */
  const updateFileInputs = useCallback(
    () => {
      if (inputFileKeys) {
        Object.keys(inputFileKeys).forEach((paramKey) => {
          const fileParamType = inputFileKeys[paramKey];
          const files = myFlowData?.[paramKey] as { file_id: string }[] | undefined;

          if (files && Array.isArray(files)) {
            if (fileParamType === FileParamType.Array) {
              // Map files to an array of { file_id: file_id } dictionaries
              const fileDictArray = files.map((file) => ({
                file_id: file.file_id,
              }));

              setFileInputData((prev) => ({
                ...prev,
                [paramKey]: fileDictArray, // Array of { file_id: file_id }
              }));
            } else {
              // Take the first file_id and create a single-entry array
              const firstFile = files[0];
              const fileDictArray = firstFile ? { file_id: firstFile.file_id } : {};

              setFileInputData((prev) => ({
                ...prev,
                [paramKey]: fileDictArray, // Single-entry array
              }));
            }
          }
        });
      }
    },
    [inputFileKeys, myFlowData]
  );

  const processOutputMessage= useCallback((execData: ExecutionData)  => {
    const automationOutput = execData.output;
    if (automationOutput && automationOutput.message) {
      setFlowExecutionMessage(automationOutput.message as string);
    } else {
      setFlowExecutionMessage('');
    } 
  },[]);

  const processInterfaceOutput = useCallback(
    async () => {
      
      const generateAutomationInterface = () => {
        const automationOutput = (myInterfaceData as InterfaceExecutionData).output;
        if (automationOutput.workers) {
          const thisAutomation = automationOutput.workers?.[scriptPath] || {};
          const automationTask = parseAutomation(node.id, {
            internal: {
              hidden: false,
              input: thisAutomation.input as JSONSchema,
              output: thisAutomation.output as JSONSchema,
            },
          });
          setInputSpec(automationTask[0].spec.input);
          setOutputSpec(automationTask[0].spec.output);
          myInterfaceData.state = NodeState.Clean;
        }
      }


      try {
        generateAutomationInterface();
        processOutputMessage(myInterfaceData);
      } catch (error) {
        console.error('Error parsing worker output', error);
        myInterfaceData.state = NodeState.Error;
      }
    },
    [myInterfaceData, scriptPath, parseAutomation, node.id, processOutputMessage]
  );


  /**
   * We have to special case scriptInterfacePath execution
   * as we get back a JSONSchema object that we need to parse
   * and use to update inputSpec and outputSpec.
   * For normal executions we just update the flowData with the output.
   * and notify our connections of hte change.
   */
  const processAutomationOutput = useCallback(
    async () => {


      const fetchAndResolveFiles = async (fileIds: string[]) => {
        const resolvedFiles = [];
        for (const file_id of fileIds) {
          try {
            const file = await getFile(file_id); // Call your API to resolve file_id
            resolvedFiles.push(file);
          } catch (error) {
            console.error(`Failed to resolve file_id: ${file_id}`, error);
            resolvedFiles.push(null);
          }
        }
        return resolvedFiles;
      };

      const updateFlowData = () => {
        const automationOutput = (myExecutionData as AutomationExecutionData).output;
        if (automationOutput.files) {
          const fileKeys = Object.keys(automationOutput.files);
          for (const fileKey of fileKeys) {
            const fileIds = automationOutput.files[fileKey];
            if (Array.isArray(fileIds)) {
              fetchAndResolveFiles(fileIds).then((resolvedFiles) => {
                setFlowData(node.id, fileKey, resolvedFiles.filter((file)=>(file!==null))); // Update flowData with resolved files
                myExecutionData.state = NodeState.Done;
              });
            }
          }
        }
      }

      try {
        updateFlowData();
        processOutputMessage(myExecutionData);
      } catch (error) {
        console.error('Error parsing worker output', error);
        myExecutionData.state = NodeState.Error;
      }
    },
    [ myExecutionData, node.id, setFlowData, getFile, processOutputMessage]
  );


  // Update fileInputs when flowData changes or when the fileparams change
  useEffect(() => {
    if (inputFileKeys)
      updateFileInputs();
    else
      setFileInputData({});

    updateNodeInternals(node.id);
    
  }, [inputFileKeys, myFlowData, node.id, setFileInputData, updateNodeInternals, updateFileInputs]);


  // Process automation output when execution data changes
  useEffect(() => {
    const executed = myExecutionData.state === NodeState.Executed;
    if (executed) processAutomationOutput();
  }, [myExecutionData, processAutomationOutput]);

  // Process automation output when execution data changes
  useEffect(() => {
    const executed = myInterfaceData.state === NodeState.Executed;
    if (executed) processInterfaceOutput();
  }, [myInterfaceData, processInterfaceOutput]);

  // Update node save data when it changes
  useEffect(() => {
    node.data.inputData = {...inputData, ...fileInputData};
    if (isScriptNode) {
      node.data.scriptContent = scriptContent;
      node.data.inputSpec = inputSpec;
      node.data.outputSpec = outputSpec;
    } 
    node.data.executionData = myExecutionData;
  }, [node.data, inputData, fileInputData, scriptContent, inputSpec, outputSpec, isScriptNode, myExecutionData]);


  const inputPositions = Array.from(Object.keys(inputFileKeys))
    .map((_, index) => `${(index + 1) * (100 / (Object.keys(inputFileKeys).length + 1))}%`);
  const outputPositions = Array.from(outputFileKeys)
    .map((_, index, array) => `${(index + 1) * (100 / (array.length + 1))}%`);

  const min = 640;
  const delta = 10;

  return (
    <div  style={{  height: '100%', width:'100%', display:'flex', flexDirection:'column' }}>
      {isScriptNode && <NodeResizer  minHeight={min+delta} minWidth={min+delta} />}

      <div className={`mythica-node worker ${isScriptNode && 'script'} ${myExecutionData.state}`}
           style={{  flex:'1 1 auto', display: 'flex', flexDirection: 'column', minHeight:min}}>
        <AutomationInputs inputSchema={inputSpec} onChange={setInputData} onFileParameterDetected={handleFileParameterDetected} />
        <AutomationOutputs outputSchema={outputSpec} outputData={myExecutionData.output} onFileOutputDetected={handleFileOutputDetected} />
        <div>
          <h3>{automationTask.uri}</h3>
          <p>State: {myExecutionData.state}</p>
        </div>

        {/* Input Handles */}
        {Array.from(Object.keys(inputFileKeys)).map((paramKey, index) => (
          <FileInputHandle
            key={paramKey}
            id={paramKey}
            left={inputPositions[index]}
            isConnectable
            style={{ background: '#007bff' }}
            label={paramKey + (inputFileKeys[paramKey] === FileParamType.Array ? '[ ]' : '')}/>
        ))}

        {isScriptNode && (
          <div className="script-editor nodrag" 
               style={{ flex:'1 1 0',display:'flex', flexDirection:'column', minHeight:'0' }}>
            {/* Make the editor container fill the available space */}
            <div style={{ flex:'1 1 0', height:'100%'}}>
              <MonacoEditor
                language="python"
                theme="vs-dark"
                defaultValue={scriptContent || template}
                onChange={handleEditorChange}
                options={{ 
                  minimap: { enabled: false },
                  automaticLayout: true,
                  // This is important for auto resizing
                }}
              />
            </div>
          </div>
        )}
        {isScriptNode && (
          <div>
            <pre style={{ overflow: 'auto' }}>
              {flowExecutionMessage}
            </pre>
          </div>
        )}

        {/* Output Handles */}
        {Array.from(outputFileKeys).map((outputKey, index) => (
          <FileOutputHandle
            key={outputKey}
            id={outputKey}
            left={outputPositions[index]}
            isConnectable
            style={{ background: '#007bff' }}
            label={outputKey + '[ ]'}/>
        ))}

        <button onClick={handleRunAutomation} disabled={myExecutionData.state! in [NodeState.Clean, NodeState.Error]}>
          Run Automation
        </button>
        <div style={{height:'24px'}}/>
      </div>
    </div>
  );
};

export default memo(AutomationNode);
