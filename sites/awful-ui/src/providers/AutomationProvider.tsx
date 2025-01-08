// src/context/AutomationContext.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { NodeState } from '../types/AwfulFlow';
import useMythicaApi from '../hooks/useMythicaApi'; // Import AuthContext to access apiKey
import {
  dictionary,
  WorkerAutomations,
  ExecutionData,
  AutomationTask,
  AutomationSpec,
} from '../types/Automation';
import { AutomationContext } from '../hooks/useAutomation';
import { AutomationScript } from '../types/Automation';
import { v4 as uuidv4 } from 'uuid';

// Static worker list and endpoint
const WORKERS: string[] = import.meta.env.VITE_AWFUL_WORKERS.split(','); //'genai'
const BASE_URL: string = import.meta.env.VITE_AWFUL_REST_URL;

const AutomationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [workers] = useState(WORKERS);
  const { authToken, getFiles, getDownloadInfo, uploadFile, deleteFile } =
    useMythicaApi();
  const [loaded, setLoaded] = useState(false);
  const [workerAutomations, setAutomations] = useState<WorkerAutomations>({});

  const [savedAutomationsById, setSavedAutomationsById] = useState<{
    [id: string]: AutomationScript;
  }>({});
  const [savedAutomationsByWorker, setSavedAutomationsByWorker] = useState<{
    [worker: string]: AutomationScript[];
  }>({});

  /***************************************************************************
   * Script Automation Save Handling
   **************************************************************************/
  const getUri = (worker: string, name: string) =>  
    `saved://${worker}/${name?.toLowerCase().replace(/\s+/g, '_')}`;

  const newAutomation = (
    worker: string,
    name: string,
    script: string
  ) => {
    const saved = savedAutomationsByWorker[worker]?.find(
      (a) => a.name === name
    ) as AutomationScript;
    if (saved) return saved;

    return {
      id: uuidv4(),
      uri: getUri(worker, name),
      worker: worker,
      name: name,
      script: script
    } as AutomationScript;
  };

  // Save the current automation to the API
  const saveAutomation = async (
    automation: AutomationScript,
    savedAutomation: (saved: AutomationScript) => void
  ) => {
    try {
      if (automation.file) {
        await deleteFile(automation.file.file_id);
        delete automation.file;
      }
      automation.uri = getUri(automation.worker, automation.name);

      const blob = new Blob([JSON.stringify(automation)], {
        type: 'application/json',
      });
      const formData = new FormData();
      formData.append('files', blob, `${automation.name}.awpy`);
      await uploadFile(formData);
      const { autosById } = await fetchAutomations();
      const save = autosById[automation.id];
      savedAutomation(save);
    } catch (error) {
      console.error(`Failed to save automation ${automation.id}`, error);
    }
  };
  const deleteAutomation = async (automation: AutomationScript) => {
    try {
      if (!automation.file) {
        console.warn(`Automation ${automation.id} had no saves`);
        return;
      }

      await deleteFile(automation.file.file_id);
      await fetchAutomations();
      console.log(`Automaiton ${automation.id} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete file ${automation.id}.awful:`, error);
    }
  };

  const fetchAutomations = useCallback(async () => {
    const autosByWorker = {} as { [worker: string]: AutomationScript[] };
    const autosById = {} as { [id: string]: AutomationScript };

    if (authToken) {
      try {
        // Filter files with the .awful extension
        const files = (await getFiles())
          .filter((file) => file.file_name.endsWith('.awpy'))
          .map((file) => {
            file.file_name = file.file_name.replace(/\.awpy$/, '');
            return file;
          });

        for (const file of files) {
          const fileData = await getDownloadInfo(file.file_id);
          const response = await fetch(fileData.url); // Fetch the file content from the URL
          const automation = await response.json(); // Assuming the file content is JSON
          automation.file = file;
          if (!autosByWorker[automation.worker])
            autosByWorker[automation.worker] = [];
          autosByWorker[automation.worker].push(automation);
          autosById[automation.id] = automation;
        }

        setSavedAutomationsByWorker(autosByWorker);
        setSavedAutomationsById(autosById);
      } catch (error) {
        console.error('Failed to fetch saved files:', error);
      }
    }
    return { autosByWorker, autosById };
  }, [authToken, getFiles, getDownloadInfo]);

  // Fetch saved automations when the component loads
  useEffect(() => {
    fetchAutomations();
  }, [authToken, fetchAutomations]);
  /***************************************************************************
   * End Script Automation Save Handling
   **************************************************************************/

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
  const parseAutomation = useCallback(
    (
      worker: string,
      workerSpecs: { [path: string]: AutomationSpec }
    ): AutomationTask[] => {
      return Object.keys(workerSpecs).map((path: string) => ({
        uri: `${worker}:/${path}`,
        worker: worker,
        path,
        spec: {
          input: workerSpecs[path].input,
          output: workerSpecs[path].output,
          hidden: workerSpecs[path].hidden || false,
        },
      })) as AutomationTask[];
    },
    []
  );

  /**
   * Load automations for each worker in the WORKERS list. This is the starting point for
   * the application and requires a profile (which should be automatically loaded by the
   * MythicaApiProvider when an API key is enterered)
   */
  const loadAutomations = useCallback(async () => {
    if (!authToken) return; // Ensure profileId is available

    workers.map(async (worker) => {
      try {
        axios
          .post(
            BASE_URL,
            {
              work_guid: '', // Generate or retrieve unique work_id if needed
              channel: worker,
              path: '/mythica/automations',
              env:
                import.meta.env.MODE === 'staging' ? 'staging' : 'production',
              auth_token: authToken, // Use dynamic profile_id
              data: {},
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
          .then((response) => {
            const workerDef = parseAutomation(
              worker,
              response.data.result?.automations
            );
            setAutomations((prev) => ({ ...prev, [worker]: workerDef }));
            console.debug(
              `Loaded automations for worker: ${worker}`,
              workerDef
            );
          });
      } catch (error) {
        console.warn(`Failed to load automations for worker: ${worker}`, error);
        // Continue without this worker
      }
    });
  }, [parseAutomation, authToken, workers]);

  const allAutomations = useMemo(() => {
    const flatAutomations: { [uri: string]: AutomationTask } = {};

    Object.values(workerAutomations).forEach((tasks) => {
      tasks.forEach((task) => {
        flatAutomations[task.uri] = task;
      });
    });

    return flatAutomations;
  }, [workerAutomations]);

  const initAutomation = (task: AutomationTask): ExecutionData => {
    return {
      worker: task?.worker,
      path: task?.path,
      state: NodeState.Clean,
      output: {},
    };
  };

  /**
   * Execute an automation.
   *
   * @param worker
   * @param nodeId
   * @param path
   * @param inputData
   * @returns
   */
  const runAutomation = useCallback(
    async (
      worker: string,
      nodeId: string,
      path: string,
      inputData: dictionary,
      responseCallback: React.Dispatch<React.SetStateAction<ExecutionData>>
    ) => {
      if (!authToken) return;

      try {
        responseCallback((prevData) => ({
          ...prevData,
          state: NodeState.Running,
        }));

        const env =
          import.meta.env.MODE === 'staging' ? 'staging' : 'production';
        if (inputData.script) inputData.env = env;
        // Send request to the backend
        const response = await axios.post(BASE_URL, {
          work_guid: nodeId,
          channel: worker,
          env: import.meta.env.MODE === 'staging' ? 'staging' : 'production',
          path: path,
          auth_token: authToken,
          data: inputData,
        });

        // Update worker state to "executed" with result
        responseCallback((prevData) => ({
          ...prevData,
          state: NodeState.Executed,
          output: response.data.result,
        }));
      } catch (error) {
        console.error(`Failed to run worker ${nodeId}`, error);
        // Update state to "error" if there was an issue
        responseCallback((prevData) => ({
          ...prevData,
          state: NodeState.Error,
          output: { message: error },
        }));
      }
    },
    [authToken]
  );

  useEffect(() => {
    if (!loaded && authToken) {
      try {
        loadAutomations();
        setLoaded(true);
      } catch (error) {
        console.error('Failed to load automations:', error);
      }
    }
  }, [loadAutomations, loaded, authToken, workerAutomations]); // Only re-run when apiKey changes

  return (
    <AutomationContext.Provider
      value={{
        workers,
        automations: workerAutomations,
        allAutomations,
        loadAutomations,
        initAutomation,
        runAutomation,
        parseAutomation,
        newAutomation,
        savedAutomationsByWorker,
        savedAutomationsById,
        saveAutomation,
        deleteAutomation,
      }}
    >
      {children}
    </AutomationContext.Provider>
  );
};

export default AutomationProvider;
