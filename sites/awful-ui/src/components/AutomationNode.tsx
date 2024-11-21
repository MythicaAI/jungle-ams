import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import MonacoEditor from '@monaco-editor/react';

import useAutomation from '../hooks/useAutomation';
import useAwfulFlow from '../hooks/useAwfulFlow';
import useMythicaApi from '../hooks/useMythicaApi';

import AutomationInputs from './AutomationInputs';
import AutomationOutputs from './AutomationOutputs';

import { dictionary, AutomationTask, FileParamType } from '../types/Automation';
import { NodeState } from "../types/AwfulFlow";
import { JSONSchema } from '../types/JSONSchema';

export interface AutomationNodeProps {
  id: string;
  data: AutomationTask;
}

export type AutomationOutputType = {
  files?: {
    [key: string]: string[];
  };
  [key: string]: unknown;
};

const AutomationNode: React.FC<AutomationNodeProps> = (node) => {
  const scriptPath = '/mythica/script';
  const scriptInterfacePath = '/mythica/script/interface';
  const isScriptNode = node.data.path === scriptPath;

  const { getExecutionData, runAutomation, parseAutomation } = useAutomation();       //provides automation related services. 
  const { flowData, setFlowData, notifyTargets} = useAwfulFlow();   //node data mapped to connections

  const [inputSpec, setInputSpec] = useState(!isScriptNode?node.data.spec.input:{title:'Empty',type:'string'});
  const [outputSpec, setOutputSpec] = useState(!isScriptNode?node.data.spec.input:{title:'Empty',type:'string'});

  const [inputData, setInputData] = useState<dictionary>({});
  const [fileParams, setFileParams] = useState<Record<string, FileParamType>>({}); // Store file_id parameters
  const [fileInputs, setFileInputs] = useState<dictionary>({});
  const [fileOutputs, setFileOutputs] = useState<Set<string>>(new Set()); // Store file_id parameters
  const [scriptContent, setScriptContent] = useState<string>(''); // State to store Monaco editor content
  const updateNodeInternals = useUpdateNodeInternals();

  const {getFile} = useMythicaApi();

  const executionData = getExecutionData(node.id);  
  const nodeState = executionData.state || NodeState.Clean;
  const automationOutput = executionData.output as AutomationOutputType & { workers?: { [key: string]: { input?: JSONSchema, output?: JSONSchema } } };
  const typingTimeout = useRef(500);
  const [execMessage, setExecMessage] = useState<string>('');

  const handleFileParameterDetected = useCallback((fileParams: Record<string, FileParamType>) => {
    setFileParams(fileParams);
    updateNodeInternals(node.id);
  }, [node.id, updateNodeInternals]);

  const handleFileOutputDetected = useCallback((fileOutputKeys: Set<string>) => {
    setFileOutputs(fileOutputKeys);
    updateNodeInternals(node.id);
  }, [node.id, updateNodeInternals]);



  useEffect(() => {
    if (fileParams) {
        Object.keys(fileParams).forEach((paramKey) => {
            const fileParamType = fileParams[paramKey];
            const files = flowData[node.id]?.[paramKey] as { file_id: string }[] | undefined;

            if (files && Array.isArray(files)) {
                if (fileParamType === FileParamType.Array) {
                    // Map files to an array of { file_id: file_id } dictionaries
                    const fileDictArray = files.map((file) => ({
                        file_id: file.file_id,
                    }));

                    setFileInputs((prev) => ({
                        ...prev,
                        [paramKey]: fileDictArray, // Array of { file_id: file_id }
                    }));
                } else {
                    // Take the first file_id and create a single-entry array
                    const firstFile = files[0];
                    const fileDictArray = firstFile ? [{ file_id: firstFile.file_id }] : [];

                    setFileInputs((prev) => ({
                        ...prev,
                        [paramKey]: fileDictArray, // Single-entry array
                    }));
                }
            }
        });
    }
  }, [fileParams, flowData, node, updateNodeInternals]);



  const handleRunAutomation = () => {
    if (isScriptNode) {
      runAutomation(node.data.worker, node.id, node.data.path, {script:scriptContent, request_data: {...inputData, ...fileInputs}});
    } else {  
      runAutomation(node.data.worker, node.id, node.data.path, {...inputData, ...fileInputs});
    }
  };


  /**
   * We have to special case scriptInterfacePath execution
   * as we get back a JSONSchema object that we need to parse
   * and use to update inputSpec and outputSpec.
   * For normal executions we just update the flowData with the output.
   * and notify our connections of hte change.
   */
  useEffect(() => {
    const executed = nodeState === NodeState.Executed; 
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

    const processAutomationOutput = async () => {
        try {
            if (isScriptNode && executed && executionData.path === scriptInterfacePath) {
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
                    executionData.state = NodeState.Clean;
                }
            } else if (executed) {
                if (automationOutput.files) {
                    const fileKeys = Object.keys(automationOutput.files);
                    for (const fileKey of fileKeys) {
                        const fileIds = automationOutput.files[fileKey];
                        if (Array.isArray(fileIds)) {
                            const resolvedFiles = await fetchAndResolveFiles(fileIds);
                            setFlowData(node.id, fileKey, resolvedFiles); // Update flowData with resolved files
                            notifyTargets(node.id, fileKey, resolvedFiles); // Notify connections of the change
                        }
                    }
                }
                executionData.state = NodeState.Done;
            }
            if (automationOutput && automationOutput.message) {
                setExecMessage(automationOutput.message as string);
            } else {
                setExecMessage('');
            }
        } catch (error) {
            console.error('Error parsing worker output', error);  
            executionData.state = NodeState.Error;
        }
    };

    processAutomationOutput();
}, [
  executionData, 
  isScriptNode, 
  node, 
  nodeState, 
  notifyTargets, 
  parseAutomation, 
  setFlowData, 
  automationOutput, 
  getFile
]); // Dependency on workerOutput changes

  const inputPositions = Array.from(Object.keys(fileParams))
    .map((_, index) => `${(index + 1) * (100 / (Object.keys(fileParams).length + 1))}%`);
  const outputPositions = Array.from(fileOutputs)
    .map((_, index, array) => `${(index + 1) * (100 / (array.length + 1))}%`);

  // Handler for Monaco editor changes
  const handleEditorChange = (value: string | undefined) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    setScriptContent(value || '');
    typingTimeout.current = setTimeout(() => {
      runAutomation(node.data.worker, node.id, scriptInterfacePath, {'script': value || ''});
    }, 2000); // Adjust delay as needed
  };

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
  
  
  return (
    <div className={`mythica-node worker ${nodeState}`}>
      <h3>{node.data.uri}</h3>
      <p>State: {nodeState}</p>

      <AutomationInputs inputSchema={inputSpec} onChange={setInputData} onFileParameterDetected={handleFileParameterDetected} />
      <AutomationOutputs key={JSON.stringify(outputSpec)} outputSchema={outputSpec} outputData={automationOutput || {}} onFileOutputDetected={handleFileOutputDetected} />

      {/* Render handles for FileParameter inputs */}
      {Array.from(Object.keys(fileParams)).map((paramKey, index) => (
        <div
          key={paramKey}
          className="file-handle"
          style={{
            top: '0px',
            left: inputPositions[index],
            transform: 'translateX(-50%)',
          }}
        >
          <Handle
            type="target"
            position={Position.Top}
            id={paramKey}
            isConnectable
            style={{ background: '#555' }}
          />
          <span className='label'>
            { paramKey } 
            { 
              (fileParams[paramKey] === FileParamType.Array) ? '[ ]' :''
            }
          </span>
        </div>
      ))}
      <p/>
      {isScriptNode && (
        <div className="script-editor">
          <MonacoEditor
            width="640px"
            height="480px"
            language="python"
            theme="vs-dark"
            defaultValue={template}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false } }}
          />
          <pre style={{width:640, overflow:'scroll'}}>{execMessage}</pre>
        </div>
      )}

      {/* Render handles for OutputFiles */}
      {Array.from(fileOutputs).map((outputKey, index) => (
          <div
            key={outputKey}
            className="file-handle"
            style={{
              bottom: '0px',
              left: outputPositions[index],
              transform: 'translateX(-50%)',
            }}
          >
            <Handle
              type="source"
              position={Position.Bottom}
              id={outputKey}
              isConnectable
              style={{ background: '#007bff' }}
            />
            <span className='label'>{outputKey}[ ]</span>
          </div>
        ))
      }
    <p/>

      <button onClick={handleRunAutomation} disabled={nodeState !in [NodeState.Clean, NodeState.Error]}>
        Run Automation
      </button>

    </div>
  );
};

export default AutomationNode;
