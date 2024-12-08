import React, { memo, useCallback, useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import hou from "../types/Houdini";

import useAutomation from "../hooks/useAutomation";
import useAwfulFlow from "../hooks/useAwfulFlow";
import { GetFileResponse } from "../types/MythicaApi";
import { NodeState } from "../types/AwfulFlow";
import ParmGroup from "./HoudiniParms/ParmGroup";
import { dictionary, ExecutionData } from "../types/Automation";

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

    const { initAutomation, runAutomation, allAutomations} = useAutomation();
    const automationTask = allAutomations[node.data.automation]
    const [ myInterfaceData, setMyInterfaceData ] = useState<ExecutionData>(
        node.data.interfaceData || initAutomation(automationTask)
    );
    //const [ myExecutionData, setMyExecutionData ] = useState<ExecutionData>(
    //    node.data.executionData || initAutomation(automationTask)
    //);
    const [parmTemplateGroups, setParmTemplateGroups] = useState<hou.ParmTemplateGroup[]>([]);
    
    const [inputData,setInputData] = useState<dictionary>({});

    const handleParmChange = (formData: dictionary) => {
      setInputData({...inputData, ...formData});
      return formData;
    };

    const updateInterface = useCallback(() => {

        if (myInterfaceData.state !== NodeState.Executed) return;

        try{
            const strPts = (myInterfaceData as InterfaceExecutionData).output?.node_types.map((nt) => nt.code) || [];
            const parmTGs = [];
            for (const strPt of strPts) {
                const getParmTemplateGroup = eval(strPt);
                parmTGs.push(getParmTemplateGroup(hou));
            }
            setParmTemplateGroups(parmTGs);
            if(parmTGs.length>0)
                parmTGs[0].draw();
            myInterfaceData.state=NodeState.Done;
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

    return (
        <div className={`mythica-node worker`}>
          <h3>{automationTask.uri}</h3>
        
          {/* Render handles for FileParameter inputs */}
            <div
              key={INPUT_FILE}
              className="file-handle"
              style={{
                top: '0px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Handle
                type="target"
                position={Position.Top}
                id={INPUT_FILE}
                isConnectable
                style={{ background: '#007bff' }}
              />
              <span className='label'>
                {INPUT_FILE}
              </span>
            </div>
          <p />
          {parmTemplateGroups[0]?
              <ParmGroup onChange={handleParmChange} group={parmTemplateGroups[0]} />
                : <></>
        }
        </div>
      );
}

export default memo(HDANode);