import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import MonacoEditor from '@monaco-editor/react';

import useAutomation from '../hooks/useAutomation';
import useAwfulFlow from '../hooks/useAwfulFlow';
import useMythicaApi from '../hooks/useMythicaApi';

import AutomationInputs from './AutomationInputs';
import AutomationOutputs from './AutomationOutputs';

import { dictionary, FileParamType } from '../types/Automation';
import { NodeState } from "../types/AwfulFlow";
import { JSONSchema } from '../types/JSONSchema';

export interface AutomationNodeProps {
  id: string;
  data: {
    automation: string;
    inputData: dictionary;
    scriptContent: string;
  }
}

export type AutomationOutputType = {
  files?: {
    [key: string]: string[];
  };
  [key: string]: unknown;
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

const AutomationNode: React.FC<AutomationNodeProps> = (node) => {
  const scriptPath = '/mythica/script';
  const scriptInterfacePath = '/mythica/script/interface';

  const { getExecutionData, runAutomation, parseAutomation, allAutomations } = useAutomation();       //provides automation related services. 
  const automationTask = allAutomations[node.data.automation];
  const isScriptNode = automationTask.path === scriptPath;

  const { flowData, setFlowData, notifyTargets } = useAwfulFlow();   //node data mapped to connections


  const [inputSpec, setInputSpec] = useState(!isScriptNode ? automationTask.spec.input : { title: 'Empty', type: 'string' });
  const [outputSpec, setOutputSpec] = useState(!isScriptNode ? automationTask.spec.input : { title: 'Empty', type: 'string' });

  const [inputData, setInputData] = useState<dictionary>(node.data.inputData); // State to store input data
  const [fileParams, setFileParams] = useState<Record<string, FileParamType>>(node.data.fileparams || []); // Store file_id parameters
  const [fileInputs, setFileInputs] = useState<dictionary>({});
  const [fileOutputs, setFileOutputs] = useState<Set<string>>(node.data.fileOutputs || new Set()); // Store file_id parameters
  const [scriptContent, setScriptContent] = useState<string>(node.data.scriptContent || template); // State to store Monaco editor content
  const updateNodeInternals = useUpdateNodeInternals();

  const { getFile } = useMythicaApi();

  const myFlowData = flowData[node.id];

  const myExecutionData = getExecutionData(node.id);
  const nodeState = myExecutionData.state || NodeState.Clean;
  const typingTimeout = useRef(500);
  const [execMessage, setExecMessage] = useState<string>('');

  // Handler for FileParameter inputs detected by AutomationInputs
  const handleFileParameterDetected = useCallback((fileParams: Record<string, FileParamType>) => {
    setFileParams(fileParams);
    updateNodeInternals(node.id);
  }, [node.id, updateNodeInternals]);

  // Handler for FileOutput keys detected by AutomationOutputs
  const handleFileOutputDetected = useCallback((fileOutputKeys: Set<string>) => {
    setFileOutputs(fileOutputKeys);
    updateNodeInternals(node.id);
  }, [node.id, updateNodeInternals]);

  // Handler for running the automation
  const handleRunAutomation = () => {
    if (isScriptNode) {
      runAutomation(automationTask.worker, node.id, automationTask.path, { script: scriptContent, request_data: { ...inputData, ...fileInputs } });
    } else {
      runAutomation(automationTask.worker, node.id, automationTask.path, { ...inputData, ...fileInputs });
    }
  };

  // Handler for Monaco editor changes
  const handleEditorChange = (value: string | undefined) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    setScriptContent(value || '');
    typingTimeout.current = setTimeout(() => {
      runAutomation(automationTask.worker, node.id, scriptInterfacePath, { 'script': value || '' });
    }, 2000); // Adjust delay as needed
  };

  /**
   * Update fileInputs with the resolved file_id values
   * when the flowData changes.
   * This is necessary to ensure that the fileInputs
   *  are up-to-date with the latest file_id values.
   */
  const updateFileInputs = useCallback(
    () => {
      if (fileParams) {
        Object.keys(fileParams).forEach((paramKey) => {
          const fileParamType = fileParams[paramKey];
          const files = myFlowData?.[paramKey] as { file_id: string }[] | undefined;

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
              const fileDictArray = firstFile ? { file_id: firstFile.file_id } : {};

              setFileInputs((prev) => ({
                ...prev,
                [paramKey]: fileDictArray, // Single-entry array
              }));
            }
          }
        });
      }
    },
    [fileParams, myFlowData]
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

      const executed = myExecutionData.state === NodeState.Executed;
      const automationOutput = myExecutionData.output as AutomationOutputType & { workers?: { [key: string]: { input?: JSONSchema, output?: JSONSchema } } };

      try {
        if (isScriptNode && executed && myExecutionData.path === scriptInterfacePath) {
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
            myExecutionData.state = NodeState.Clean;
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
          myExecutionData.state = NodeState.Done;
        }
        if (automationOutput && automationOutput.message) {
          setExecMessage(automationOutput.message as string);
        } else {
          setExecMessage('');
        }
      } catch (error) {
        console.error('Error parsing worker output', error);
        myExecutionData.state = NodeState.Error;
      }
    },
    [
      myExecutionData, 
      isScriptNode, 
      node.id, 
      getFile, 
      notifyTargets, 
      parseAutomation, 
      setFlowData
    ]
  );

  // Update fileInputs when flowData changes or when the fileparams change
  useEffect(() => {
    if (fileParams)
      updateFileInputs();
    else
      setFileInputs({});

    updateNodeInternals(node.id);
    
  }, [fileParams, node.id, setFileInputs, updateNodeInternals, updateFileInputs]);


  // Process automation output when execution data changes
  useEffect(() => {
    processAutomationOutput();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myExecutionData]);

  // Update interface when component loads
  useEffect(() => {
    if (scriptContent) handleEditorChange(scriptContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update node save data when scriptContent or inputData changes
  useEffect(() => {
    node.data.scriptContent = scriptContent;
    node.data.inputData = inputData;
    node.data.fileparams = fileParams;
    node.data.fileOutputs = fileOutputs;
  }, [node.data, inputData, scriptContent, fileParams, fileOutputs]);


  const inputPositions = Array.from(Object.keys(fileParams))
    .map((_, index) => `${(index + 1) * (100 / (Object.keys(fileParams).length + 1))}%`);
  const outputPositions = Array.from(fileOutputs)
    .map((_, index, array) => `${(index + 1) * (100 / (array.length + 1))}%`);


  return (
    <div className={`mythica-node worker ${nodeState}`}>
      <h3>{automationTask.uri}</h3>
      <p>State: {nodeState}</p>

      <AutomationInputs inputSchema={inputSpec} onChange={setInputData} onFileParameterDetected={handleFileParameterDetected} />
      <AutomationOutputs key={JSON.stringify(outputSpec)} outputSchema={outputSpec} outputData={myExecutionData.output || {}} onFileOutputDetected={handleFileOutputDetected} />

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
            style={{ background: '#007bff' }}
          />
          <span className='label'>
            {paramKey}
            {
              (fileParams[paramKey] === FileParamType.Array) ? '[ ]' : ''
            }
          </span>
        </div>
      ))}
      <p />
      {isScriptNode && (
        <div className="script-editor">
          <MonacoEditor
            width="640px"
            height="480px"
            language="python"
            theme="vs-dark"
            defaultValue={scriptContent || template}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false } }}
          />
          <pre style={{ width: 640, overflow: 'scroll' }}>{execMessage}</pre>
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
      <p />

      <button onClick={handleRunAutomation} disabled={nodeState! in [NodeState.Clean, NodeState.Error]}>
        Run Automation
      </button>

    </div>
  );
};

export default AutomationNode;
