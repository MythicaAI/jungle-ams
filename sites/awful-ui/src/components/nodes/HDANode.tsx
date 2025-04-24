import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import useAutomation from '../../hooks/useAutomation';
import useAwfulFlow from '../../hooks/useAwfulFlow';
import { GetFileResponse } from '../../types/MythicaApi';
import { NodeState } from '../../types/AwfulFlow';
import { hou, ParmGroup, dictionary } from 'houdini-ui';
import { ExecutionData } from '../../types/Automation';
import FileInputHandle from '../handles/FileInputHandle';
import FileOutputHandle from '../handles/FileOutputHandle';
import { Button, Typography } from '@mui/joy';
import useMythicaApi from '../../hooks/useMythicaApi';
import { NodeDeleteButton } from './ux/NodeDeleteButton';
import { useReactFlow } from '@xyflow/react';
import { NodeHeader } from './ux/NodeHeader';
import { AutomationNodeProps } from './AutomationNode';


type InterfaceExecutionData = ExecutionData & {
  output: {
    node_types: [
      {
        root: boolean;
        subnet: string;
        help: string;
        inputs: number;
        outputs: number;
        code: string;
        category: string;
        namespace: string;
        name: string;
        version: string;
        type: string;
        description: string;
      }
    ];
    [key: string]: unknown;
  };
};
export type AutomationExecutionData = ExecutionData & {
  output: {
    files?: {
      [key: string]: string[];
    };
    [key: string]: unknown;
  };
};

const INPUT_FILE = 'HDA';

const HDANode: React.FC<AutomationNodeProps> = (node) => {
  node.data.automation = 'houdini://mythica/hda';

  // Flow data for the interface (HDA -> /mythica/hda)
  const [interfaceFlowData, setInterfaceFlowData] = useState<GetFileResponse[]>(
    []
  );
  // Flow data for the execution (HDA -> /mythica/run_hda)
  const [executionFlowData, setExecutionFlowData] = useState<{
    [key: string]: GetFileResponse[];
  }>({});

  const { deleteElements } = useReactFlow();
  const { getFlowData, setFlowData } = useAwfulFlow();

  const myFlowData = getFlowData(node.id);

  const { initAutomation, runAutomation, allAutomations } = useAutomation();
  const automationTask = allAutomations[node.data.automation];

  //Execution data for the interface of the automation
  //This returns a javascript spec used to isntantiate houdini controls
  const [myInterfaceData, setMyInterfaceData] = useState<ExecutionData>(
    initAutomation(automationTask)
  );

  //Execution data for the automation
  //This returns the results (files and values) of running the HDA
  const [myExecutionData, setMyExecutionData] = useState<ExecutionData>(
    node.data.executionData || initAutomation(automationTask)
  );

  const { getFile } = useMythicaApi();

  const [flowExecutionMessage, setFlowExecutionMessage] = useState<string>('');

  //The ParmTemplateGroup instantiated from the Script in myInterfaceData
  const [parmTemplateGroup, setParmTemplateGroup] =
    useState<hou.ParmTemplateGroup>();
  const [nodeType, setNodeType] = useState<dictionary>({});

  //Input (form) data from ParmGroup component
  const [inputData, setInputData] = useState<dictionary>(
    node.data.inputData || { nonce: 'nonce' }
  );
  //FileParameter  Inputs are handled separately based on flowData
  const [fileInputData, setFileInputData] = useState<dictionary>({});

  // Handler for when ParmGroup or subcomponents update
  const handleParmChange = useCallback(
    (formData: dictionary) => {
      setInputData((prev) => ({ ...prev, ...formData }));
    },
    [setInputData]
  );

  const handleFileUpload = useCallback(
    (formData: Record<string,File>, callback: (file_id:string)=>void) => {
      console.log('AWFUL UNIMPLEMENTED: File upload handler called with formData:', formData);
      callback("Not Implemented");
    },
    [setInputData]
  );


  // Handler for running the automation
  const runHda = useCallback(() => {
    runAutomation(
      'houdini',
      node.id,
      '/mythica/run_hda',
      { hda_file: [interfaceFlowData[0]][0], ...inputData, ...fileInputData },
      setMyExecutionData
    );
  }, [runAutomation, node.id, interfaceFlowData, inputData, fileInputData]);

  /**
   * Update fileInputs with the resolved file_id values
   * when the flowData changes.
   * This is necessary to ensure that the fileInputs
   *  are up-to-date with the latest file_id values.
   */
  const updateFileInputs = useCallback(() => {
    const inputCt = (nodeType.inputs as number) || 0;
    if (inputCt > 0) {
      for (let i = 0; i < inputCt; i++) {
        const fileParam = 'input' + i;
        const files = myFlowData[fileParam];

        // Take the first file_id and create a single-entry array
        const firstFile = files ? files[0] : null;
        const fileDict = firstFile ? { file_id: firstFile.file_id } : {};

        setFileInputData((prev) => ({
          ...prev,
          [fileParam]: fileDict, // Single-entry array
        }));
      }
    }
  }, [myFlowData, nodeType]);

  //Handling of execution messages coming from the HDA cook 
  const processOutputMessage = useCallback(() => {
    const automationOutput = myExecutionData.output;
    if (automationOutput && automationOutput.message) {
      setFlowExecutionMessage(automationOutput.message as string);
    } else if (automationOutput && automationOutput.error) {
      setFlowExecutionMessage(automationOutput.error as string);
    } else {
      setFlowExecutionMessage('');
    }
  }, [myExecutionData]);

  //Handling the execution of the HDA cook
  const processAutomationOutput = useCallback(async () => {
    // Method to fetch and resolve files from the API
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
    // Method to update AwfulFlow Data with the resolved files
    const updateFlowData = () => {
      const automationOutput = (myExecutionData as AutomationExecutionData)
        .output;
      if (automationOutput.files) {
        const fileKeys = Object.keys(automationOutput.files);
        for (const fileKey of fileKeys) {
          const fileIds = automationOutput.files[fileKey];
          if (Array.isArray(fileIds)) {
            fetchAndResolveFiles(fileIds).then((resolvedFiles) => {
              setFlowData(
                node.id,
                fileKey,
                resolvedFiles.filter((file) => file !== null)
              ); // Update flowData with resolved files
              myExecutionData.state = NodeState.Done;
            });
          }
        }
      }
    };

    // Update flowData and process output message when myExecutionData changes
    try {
      updateFlowData();
      processOutputMessage();
    } catch (error) {
      console.error('Error parsing worker output', error);
      myExecutionData.state = NodeState.Error;
    }
  }, [myExecutionData, node.id, setFlowData, getFile, processOutputMessage]);

  // Update ParmTemplateGroup when  interfaceFlowData is updated.
  // This callback is triggered by the useEffect hook below.
  const updateInterface = useCallback(() => {
    if (myInterfaceData.state !== NodeState.Executed) return;

    try {
      const nodeType =
        (myInterfaceData as InterfaceExecutionData).output?.node_types[0] || {};
      setNodeType(nodeType);
      const strPt =
        (myInterfaceData as InterfaceExecutionData).output?.node_types[0]
          .code || '';
      const getParmTemplateGroup = eval(strPt);
      const ptg = getParmTemplateGroup(hou) as hou.ParmTemplateGroup;
      setParmTemplateGroup(ptg);
      myInterfaceData.state = NodeState.Done;
    } catch (e) {
      console.error('Error parsing worker output', e);
      myInterfaceData.state = NodeState.Error;
    }
  }, [myInterfaceData]);
  
  // Call the automation that processed an HDA File and passing the 
  // myInterfaceData state handler as the result callback.
  // This triggers the useEffect hook below
  const updateHdaDef = useCallback(() => {
    if (interfaceFlowData && interfaceFlowData.length > 0)
      runAutomation(
        automationTask?.worker,
        node.id,
        automationTask?.path,
        { hdas: [interfaceFlowData[0]] },
        setMyInterfaceData
      );
  }, [
    automationTask?.worker,
    automationTask?.path,
    interfaceFlowData,
    node.id,
    runAutomation,
  ]);

  useEffect(() => {
    updateInterface();
  }, [myInterfaceData.output, updateInterface]);

  useEffect(() => {
    updateHdaDef();
  }, [interfaceFlowData, updateHdaDef]);

  useEffect(() => {
    node.data.inputData = inputData;
  }, [inputData, node.data]);

  useEffect(() => {
    node.data.executionData = myExecutionData;
  }, [myExecutionData, node.data]);
  
  useEffect(() => {
    setExecutionFlowData((prev) => {
      // Destructure INPUT_FILE out and collect the rest
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [INPUT_FILE]: _, ...rest } = myFlowData;
      // Only update if `prev` is not equal to `rest`
      return JSON.stringify(prev) !== JSON.stringify(rest)
        ? { ...prev, ...rest }
        : prev;
    });

    setInterfaceFlowData((prev) => {
      // Destructure INPUT_FILE and collect it
      const { [INPUT_FILE]: ifx } = myFlowData;
      // Only update if `prev` is not equal to `ifx`
      return JSON.stringify(prev) !== JSON.stringify(ifx) ? ifx : prev;
    });
    myInterfaceData.state = NodeState.Executed;
  }, [myFlowData, myInterfaceData]);

  useEffect(() => {
    if (myInterfaceData.state === NodeState.Executed) {
      updateFileInputs();
      myInterfaceData.state = NodeState.Done;
    }
  }, [interfaceFlowData, myInterfaceData, updateFileInputs]);

  useEffect(() => {
    if (myExecutionData.state === NodeState.Executed) {
      processAutomationOutput();
      myExecutionData.state = NodeState.Done;
    }
  }, [executionFlowData, myExecutionData, processAutomationOutput]);

  //Dynamic inputs generated from the input (FileParameters) in the InterfaceSpec 
  const inputs = useMemo(() => {
    return Array.from({ length: nodeType.inputs as number }, (_, i) => (
      <FileInputHandle
        key={`input${i}`}
        nodeId={node.id}
        id={`input${i}`}
        left={(i + 2) * (100 / (2 + (nodeType.inputs as number))) + '%'}
        isConnectable
        style={{ background: '#555555' }}
        label={`Input ${i}`}
      />
    ));
  }, [node.id, nodeType.inputs]);

  //Dynamic outputs generated from the output (FileParameters) in the InterfaceSpec
  const outputs = useMemo(() => {
    return Array.from({ length: nodeType.outputs as number }, (_, i) => (
      <FileOutputHandle
        key={`output${i}`}
        nodeId={node.id}
        id={`output${i}`}
        left={(i + 1) * (100 / (1 + (nodeType.outputs as number))) + '%'}
        isConnectable
        style={{ background: '#555555' }}
        label={`Output ${i}`}
      />
    ));
  }, [node.id, nodeType.outputs]);
  
  return (
    <div className={`mythica-node worker ${node.selected && 'selected'}`}
         style={{ minWidth: '500px' }}>
      <NodeDeleteButton
        onDelete={() => {
          deleteElements({ nodes: [node] });
        }}
      />
      <NodeHeader />
      <Typography level="h4">HDA: {nodeType['description'] as string}</Typography>
      <label>{nodeType['type'] as string}</label>
      <label>Interface: {myExecutionData.state} </label>
      <label>Automation: {myExecutionData.state} </label>
      {/* Render handles for FileParameter inputs */}
      <FileInputHandle
        id={INPUT_FILE}
        nodeId={node.id}
        left={100 / (2 + ((nodeType.inputs as number) || 0)) + '%'}
        isConnectable
        style={{ background: '#555555' }}
        label={INPUT_FILE}
      />

      {inputs}
      <p />

      {parmTemplateGroup ? (
        <ParmGroup
          data={inputData}
          onChange={handleParmChange}
          onFileUpload={handleFileUpload}
          group={parmTemplateGroup}
        />
      ) : (
        <></>
      )}
      {outputs}
      <div style={{ width: '100%' }}>
        <pre style={{ overflow: 'auto', maxWidth: '640px' }}>
          {flowExecutionMessage}
        </pre>
        <Button
          onClick={runHda}
          style={{ width: '100%' }}
          disabled={
            myExecutionData.state! in [NodeState.Clean, NodeState.Error]
          }
        >
          {myExecutionData.state === NodeState.Running
            ? 'Running...'
            : ' Run HDA'}
        </Button>
      </div>

      <div style={{ height: '24px' }} />
    </div>
  );
};

export default memo(HDANode);
