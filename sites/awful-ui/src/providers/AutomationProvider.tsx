// src/context/AutomationContext.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { NodeState } from "../types/AwfulFlow";
import useMythicaApi from '../hooks/useMythicaApi'; // Import AuthContext to access apiKey
import { dictionary, WorkerAutomations, ExecutionData, AutomationTask, AutomationSpec } from '../types/Automation';
import { AutomationContext } from '../hooks/useAutomation';

// Static worker list and endpoint
const WORKERS = ['houdini', 'blender', ]; //'genai'
const BASE_URL = 'https://automation-296075347103.us-central1.run.app';



const AutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [workers] = useState(WORKERS);
    const { authToken } = useMythicaApi(); 
    const [loaded,  setLoaded] = useState(false);
    const [workerAutomations, setAutomations] = useState<WorkerAutomations>({});
    const [executionData, setExecutionData] = useState<{ [workerId: string]: ExecutionData }>({});
    
    const getSaveData = () => {  
        return executionData;
    }

    const restoreSaveData = (execData: {[workerId:string]:ExecutionData}) => {
        setExecutionData(execData);
    }
    
    const getExecutionData = (nodeId: string) => {
        
        return executionData[nodeId] || { 
            worker: '', 
            path: '', 
            state: NodeState.Clean, 
            input: null, 
            output: null 
        };
    }
    
    /**
     * Parse a workerSpec into a list of AutomationTasks. Worker specs are raw responses 
     * from the /mythica/workers endpoint in the automation service.They follow the structure:
     * 
     * {
     *   input: JSONSchema,
     *   output: JSONSchema,
     *   hidden: boolean,
     * }
     */
    const parseAutomation = useCallback((worker:string,workerSpecs:{[path:string]:AutomationSpec}): AutomationTask[] => {
        return Object.keys(workerSpecs).map((path:string) => ({
            uri: `${worker}:/${path}`, 
            worker: worker,
            path,
            spec: {
                input: workerSpecs[path].input,
                output: workerSpecs[path].output,
                hidden: workerSpecs[path].hidden || false,    
            }
        })) as AutomationTask[];

    }, []);
    
    /**
     * Load automations for each worker in the WORKERS list. This is the starting point for
     * the application and requires a profile (which should be automatically loaded by the 
     * MythicaApiProvider when an API key is enterered)
     */
    const loadAutomations = useCallback(async () => {
        if (!authToken) return; // Ensure profileId is available
    
        const loadedAutomations: WorkerAutomations = {};
    
        await Promise.all(
            workers.map(async (worker) => {
                try {
                    const response = await axios.post(BASE_URL, {
                        work_id: "",  // Generate or retrieve unique work_id if needed
                        channel: worker,
                        path: "/mythica/workers",
                        auth_token: authToken,  // Use dynamic profile_id
                        data: {},
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
        
                    const workerSpec = response.data.result?.workers;

                    const workerDef =  parseAutomation(worker, workerSpec);

                    loadedAutomations[worker] = workerDef || [];
                    console.debug(`Loaded automations for worker: ${worker}`, loadedAutomations[worker]);

                } catch (error) {
                    console.warn(`Failed to load automations for worker: ${worker}`, error);
                    // Continue without this worker
                }
                
            })
        );
    
        console.debug('Final structure of loadedAutomations:', loadedAutomations);
        setAutomations(loadedAutomations);
    },[parseAutomation, authToken, workers]);

    const allAutomations = useMemo(() => {
        const flatAutomations: { [uri: string]: AutomationTask } = {};

        Object.values(workerAutomations).forEach((tasks) => {
            tasks.forEach((task) => {
                flatAutomations[task.uri] = task;
            });
        });

        return flatAutomations;
    }, [workerAutomations]);

    /**
     * Execute an automation. 
     * 
     * @param worker 
     * @param nodeId 
     * @param path 
     * @param inputData 
     * @returns 
     */
    const runAutomation = async (worker: string, nodeId: string, path: string, inputData: dictionary) => {
        if (!authToken) return;

        try {
            // Set initial state to "running"
            setExecutionData((prevData) => ({
                ...prevData,
                [nodeId]: { 
                    worker: worker,
                    path: path,
                    state: NodeState.Running,
                    input: inputData,
                    output: null
                },
            }));

            // Send request to the backend
            const response = await axios.post(BASE_URL, {
                work_id: nodeId,
                channel: worker,
                path: path,
                auth_token: authToken,
                data: inputData,
            });

            // Update worker state to "executed" with result
            setExecutionData((prevData) => ({
                ...prevData,
                [nodeId]: { 
                    worker: worker,
                    path: path,
                    state: NodeState.Executed,
                    input: inputData, 
                    output: response.data.result
                },
            }));
        } catch (error) {
            console.error(`Failed to run worker ${nodeId}`, error);
            // Update state to "error" if there was an issue
            setExecutionData((prevData) => ({
                ...prevData,
                [nodeId]: { 
                    worker: worker,
                    path: path,
                    state: NodeState.Error,
                    input: inputData, 
                    output: { message: error }
                },
            }));
        }
    };

    useEffect(() => {
        if (!loaded && authToken) {
            try {
                loadAutomations();
                setLoaded(true);
            } catch (error) {
                console.error("Failed to load automations:", error);
            }
        }
    }, [loadAutomations, loaded, authToken, workerAutomations]); // Only re-run when apiKey changes

    return (
        <AutomationContext.Provider value={{ 
            workers, 
            automations: workerAutomations, 
            allAutomations, 
            getExecutionData, 
            getSaveData, 
            restoreSaveData, 
            loadAutomations, 
            runAutomation, 
            parseAutomation }}>
            {children}
        </AutomationContext.Provider>
    );
};

export default AutomationProvider;  
