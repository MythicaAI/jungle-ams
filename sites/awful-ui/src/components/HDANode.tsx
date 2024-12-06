import React, { memo, useCallback, useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import hou from "../types/Houdini";

import useAutomation from "../hooks/useAutomation";
import useAwfulFlow from "../hooks/useAwfulFlow";
import { GetFileResponse } from "../types/MythicaApi";
import { NodeState } from "../types/AwfulFlow";
import ParmGroup from "./HoudiniParms/ParmGroup";
import { dictionary } from "../types/Automation";

export interface HDANodeProps {
    id: string;
    data: {
      automation: string;
      parmTemplates: (hou.ParmTemplateGroup)[];
    }
}

const INPUT_FILE = 'HDA';

const HDANode: React.FC<HDANodeProps> = (node) => {
    const { flowData } = useAwfulFlow();
    const inputFlowFiles = (flowData[node.id] || {})[INPUT_FILE] as (GetFileResponse | null)[];

    const { getExecutionData, runAutomation, allAutomations} = useAutomation();
    const automationTask = allAutomations[node.data.automation]
    const myExecutionData = getExecutionData(node.id);
    const [parmTemplateGroups, setParmTemplateGroups] = useState<hou.ParmTemplateGroup[]>([]);
    
    const [inputData,setInputData] = useState<dictionary>({});

    const handleParmChange = (formData: dictionary) => {
      setInputData({...inputData, ...formData});
      return formData;
    };

    const updateInterface = useCallback(() => {

        if (myExecutionData.state !== NodeState.Executed) return;

        try{
            const strPts = (myExecutionData.output?.parm_templates || []) as string[];
            const parmTGs = [];
            for (const strPt of strPts) {
                const getParmTemplateGroup = eval(strPt);
                parmTGs.push(getParmTemplateGroup(hou));
            }
            setParmTemplateGroups(parmTGs);
            if(parmTGs.length>0)
                parmTGs[0].draw();
            myExecutionData.state=NodeState.Done;
        } catch (e) {
            console.error('Error parsing worker output', e);
            myExecutionData.state = NodeState.Error;
        }
    
    }, [myExecutionData]);

    const updateHdaDef = useCallback(() => {
        if (inputFlowFiles && inputFlowFiles.length > 0) runAutomation(automationTask.worker, node.id, automationTask.path, { hdas: [inputFlowFiles[0]] });
    }, [automationTask.worker, automationTask.path, inputFlowFiles, node.id, runAutomation]);

    useEffect(() => { 
        updateInterface();
    }, [myExecutionData.output, updateInterface]);

    useEffect(() => {
        updateHdaDef();
    }, [inputFlowFiles, updateHdaDef]);

    return (
        <div className={`mythica-node worker ${myExecutionData.state}`}>
          <h3>{automationTask.uri}</h3>
          <p>State: {myExecutionData.state}</p>
        
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