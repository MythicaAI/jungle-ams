import React, { memo, useCallback, useEffect, useState } from 'react';
import hou from '../../types/Houdini';

import useAutomation from '../../hooks/useAutomation';
import useAwfulFlow from '../../hooks/useAwfulFlow';
import { GetFileResponse } from '../../types/MythicaApi';
import { NodeState } from '../../types/AwfulFlow';
import ParmGroup from './houdiniParms/ParmGroup';
import { dictionary, ExecutionData } from '../../types/Automation';
import FileInputHandle from '../handles/FileInputHandle';
import FileOutputHandle from '../handles/FileOutputHandle';
import { Button, Card } from '@mui/joy';
import useMythicaApi from '../../hooks/useMythicaApi';

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

export interface HDANodeProps {
  id: string;
  selected?: boolean;
  data: {
    automation: string;
    interfaceData: InterfaceExecutionData;
    inputData: dictionary;
    executionData: ExecutionData;
  };
}

const INPUT_FILE = 'HDA';

const HDANode: React.FC<HDANodeProps> = (node) => {
  const [interfaceFlowData, setInterfaceFlowData] = useState<GetFileResponse[]>(
    []
  );
  const [executionFlowData, setExecutionFlowData] = useState<{
    [key: string]: GetFileResponse[];
  }>({});

  const { getFlowData, setFlowData } = useAwfulFlow();

  const myFlowData = getFlowData(node.id);

  const { initAutomation, runAutomation, allAutomations } = useAutomation();
  const automationTask = allAutomations[node.data.automation];
  const [myInterfaceData, setMyInterfaceData] = useState<ExecutionData>(
    node.data.interfaceData || initAutomation(automationTask)
  );
  const [myExecutionData, setMyExecutionData] = useState<ExecutionData>(
    node.data.executionData || initAutomation(automationTask)
  );

  const { getFile } = useMythicaApi();

  const [flowExecutionMessage, setFlowExecutionMessage] = useState<string>('');

  const [parmTemplateGroup, setParmTemplateGroup] =
    useState<hou.ParmTemplateGroup>();
  const [nodeType, setNodeType] = useState<dictionary>({});

  //Input (form) data from ParmGroup component
  const [inputData, setInputData] = useState<dictionary>(
    node.data.inputData || { nonce: 'nonce' }
  );
  //FileParameter  Inputs are handled separately based on flowData
  const [fileInputData, setFileInputData] = useState<dictionary>({});

  const handleParmChange = useCallback(
    (formData: dictionary) => {
      setInputData((prev) => ({ ...prev, ...formData }));
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

  const processOutputMessage = useCallback(() => {
    const automationOutput = myExecutionData.output;
    if (automationOutput && automationOutput.message) {
      setFlowExecutionMessage(automationOutput.message as string);
    } else {
      setFlowExecutionMessage('');
    }
  }, [myExecutionData]);

  const processAutomationOutput = useCallback(async () => {
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

    try {
      updateFlowData();
      processOutputMessage();
    } catch (error) {
      console.error('Error parsing worker output', error);
      myExecutionData.state = NodeState.Error;
    }
  }, [myExecutionData, node.id, setFlowData, getFile, processOutputMessage]);
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
      ptg.draw();
      myInterfaceData.state = NodeState.Done;
    } catch (e) {
      console.error('Error parsing worker output', e);
      myInterfaceData.state = NodeState.Error;
    }
  }, [myInterfaceData]);

  const updateHdaDef = useCallback(() => {
    if (interfaceFlowData && interfaceFlowData.length > 0)
      runAutomation(
        automationTask.worker,
        node.id,
        automationTask.path,
        { hdas: [interfaceFlowData[0]] },
        setMyInterfaceData
      );
  }, [
    automationTask.worker,
    automationTask.path,
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
    myInterfaceData.state = NodeState.Executed
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

  /*
  const inputPositions = Array.from(Object.keys(inputFileKeys))
    .map((_, index) => `${(index + 1) * (100 / (Object.keys(inputFileKeys).length + 1))}%`);
  const outputPositions = Array.from(outputFileKeys)
    .map((_, index, array) => `${(index + 1) * (100 / (array.length + 1))}%`);
*/
  const inputs = Array.from({ length: nodeType.inputs as number }, (_, i) => (
    <FileInputHandle
      key={i}
      id={`input${i}`}
      left={(i + 2) * (100 / (2 + (nodeType.inputs as number))) + '%'}
      isConnectable
      style={{ background: '#007bff' }}
      label={`Input ${i}`}
    />
  ));

  const outputs = Array.from({ length: nodeType.outputs as number }, (_, i) => (
    <FileOutputHandle
      key={i}
      id={`output${i}`}
      left={(i + 1) * (100 / (1 + (nodeType.outputs as number))) + '%'}
      isConnectable
      style={{ background: '#007bff' }}
      label={`Output ${i}`}
    />
  ));
  return (
    <Card className={`mythica-node worker ${node.selected && 'selected'}`}>
      <h3 style={{ marginBottom: '2px' }}>
        {nodeType['description'] as string}
      </h3>
      <label>{nodeType['type'] as string}</label>
      <label>Interface: {myExecutionData.state} </label>
      <label>Automation: {myExecutionData.state} </label>
      {/* Render handles for FileParameter inputs */}
      <FileInputHandle
        id={INPUT_FILE}
        left={100 / (2 + ((nodeType.inputs as number) || 0)) + '%'}
        isConnectable
        style={{ background: '#007bff' }}
        label={INPUT_FILE}
      />

      {inputs}
      <p />

      {parmTemplateGroup ? (
        <ParmGroup
          data={inputData}
          onChange={handleParmChange}
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
    </Card>
  );
};

export default memo(HDANode);
