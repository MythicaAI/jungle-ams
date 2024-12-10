import React, { memo, useCallback, useEffect, useState } from "react";
import hou from "../types/Houdini";

import useAutomation from "../hooks/useAutomation";
import useAwfulFlow from "../hooks/useAwfulFlow";
import { GetFileResponse } from "../types/MythicaApi";
import { NodeState } from "../types/AwfulFlow";
import ParmGroup from "./HoudiniParms/ParmGroup";
import { dictionary, ExecutionData } from "../types/Automation";
import FileInputHandle from "./Handles/FileInputHandle";
import FileOutputHandle from "./Handles/FileOutputHandle";

type InterfaceExecutionData = ExecutionData & {
  output: {
    node_types: [{
      root: boolean;
      subnet: string;
      help: string;
      inputs: number;
      outputs: number;
      defaults: dictionary;
      code: string;
    }];
    [key: string]: unknown;
  }
};
export interface HDANodeProps {
  id: string;
  data: {
    automation: string;
    interfaceData: InterfaceExecutionData;
  }
}


const INPUT_FILE = 'HDA';

const HDANode: React.FC<HDANodeProps> = (node) => {
  const { flowData } = useAwfulFlow();
  const inputFlowFiles = (flowData[node.id] || {})[INPUT_FILE] as (GetFileResponse | null)[];

  const { initAutomation, runAutomation, allAutomations } = useAutomation();
  const automationTask = allAutomations[node.data.automation]
  const [myInterfaceData, setMyInterfaceData] = useState<ExecutionData>(
    node.data.interfaceData || initAutomation(automationTask)
  );
  //const [ myExecutionData, setMyExecutionData ] = useState<ExecutionData>(
  //    node.data.executionData || initAutomation(automationTask)
  //);
  const [parmTemplateGroup, setParmTemplateGroup] = useState<hou.ParmTemplateGroup>();
  const [nodeType, setNodeType] = useState<dictionary>({});

  const [inputData, setInputData] = useState<dictionary>({});

  const handleParmChange = (formData: dictionary) => {
    setInputData({ ...inputData, ...formData });
  };

  const updateInterface = useCallback(() => {

    if (myInterfaceData.state !== NodeState.Executed) return;

    try {
      const nodeType = (myInterfaceData as InterfaceExecutionData).output?.node_types[0] || {};
      setNodeType(nodeType);
      const strPt = (myInterfaceData as InterfaceExecutionData).output?.node_types[0].code || '';
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
    if (inputFlowFiles && inputFlowFiles.length > 0)
      runAutomation(
        automationTask.worker,
        node.id,
        automationTask.path,
        { hdas: [inputFlowFiles[0]] },
        setMyInterfaceData
      );
  }, [automationTask.worker, automationTask.path, inputFlowFiles, node.id, runAutomation]);

  useEffect(() => {
    updateInterface();
  }, [myInterfaceData.output, updateInterface]);

  useEffect(() => {
    updateHdaDef();
  }, [inputFlowFiles, updateHdaDef]);

/*
  const inputPositions = Array.from(Object.keys(inputFileKeys))
    .map((_, index) => `${(index + 1) * (100 / (Object.keys(inputFileKeys).length + 1))}%`);
  const outputPositions = Array.from(outputFileKeys)
    .map((_, index, array) => `${(index + 1) * (100 / (array.length + 1))}%`);
*/
  const inputs = Array.from({ length: (nodeType.inputs as number) }, (_, i) => (
    <FileInputHandle
      key={i}
      id={`input${i}`}
      left={((i+2)*(100/(2+(nodeType.inputs as number)))) + '%'}
      isConnectable
      style={{ background: '#007bff' }}
      label={`Input ${i}`}/>
  ));
  
  const outputs = Array.from({ length: (nodeType.outputs as number) }, (_, i) => (
    <FileOutputHandle
      key={i}
      id={`output${i}`}
      left={((i+1)*(100/(1+(nodeType.outputs as number)))) + '%'}
      isConnectable
      style={{ background: '#007bff' }}
      label={`Output ${i}`}/>
  ));
  return (
    <div className={`mythica-node worker`}>
      <h3>{automationTask.uri}</h3>

      {/* Render handles for FileParameter inputs */}
      <FileInputHandle
        id={INPUT_FILE}
        left={100/(2+((nodeType.inputs as number)||0)) + '%'}
        isConnectable
        style={{ background: '#007bff' }}
        label={INPUT_FILE}/>

      {inputs}
      <p />

      {parmTemplateGroup ?
        <ParmGroup onChange={handleParmChange} group={parmTemplateGroup} />
        : <></>
      }

      {outputs}
    </div>
  );
}

export default memo(HDANode);