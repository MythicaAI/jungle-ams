import React, { useEffect, useState } from "react";
import { useAssetVersionStore } from "../../stores/assetVersionStore";
import { AssetVersionContent, AssetVersionResponse } from "types/apiTypes";
import { JobDefinition, JobDefinitionTemplate } from "@queries/packages/types";
import { Box, Button, FormLabel, Option, Select, Typography, Modal, ModalDialog, Input } from "@mui/joy";
import SceneControls from "@components/BabylonViewer/SceneControls";
import { useSceneStore } from "scenetalk";
import { ParmFactoryProvider, ParmFactoryProps, DefaultParmFactory } from "houdini-ui";
import { useCreateJobDefinitionFromTemplate, useGetJobDefinition } from "@queries/packages";

export const AssetEditPresets: React.FC = () => {
  const assetVersion = useAssetVersionStore();
  const [selectedHda, setSelectedHda] = useState<AssetVersionContent | null>(null);
  const [newJobDefId, setNewJobDefId] = useState<string | null>(null);
  const [selectedJobDef, setSelectedJobDef] = useState<JobDefinition | null>(null);
  const [jobDefs, setJobDefs] = useState<JobDefinition[] | null>(null);
  const [hidden, setHidden] = useState<{[key: string]: boolean}>({});  
  

  const { paramValues, setParamValues } = useSceneStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"new" | "edit" | null>(null);
  const [modalInputValue, setModalInputValue] = useState("");


  const handleOpenModal = (action: "new" | "edit") => {
    setModalAction(action);
    setModalInputValue(action === "edit" ? selectedJobDef?.name || "" : "");
    setIsModalOpen(true);
  };

  const newFromTemplate = useCreateJobDefinitionFromTemplate();

  const handleModalSave = () => {

    if (modalAction === "new") {
      if (!selectedJobDef) {
        console.error("No job definition selected");
        return;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { job_def_id, owner_id, ...template } = structuredClone(selectedJobDef);
      template.params_schema.default = paramValues;
      template.params_schema.hidden = hidden;
      template.name = modalInputValue;
      template.source.entry_point = template.name.replace(/ /g, '_');

      newFromTemplate.mutate({
        job_def_id: job_def_id,
        job_def_template: template as JobDefinitionTemplate
      }, {
        onSuccess: (data) => {
          setNewJobDefId(data.job_def_id);
          jobDefResp.refetch();
        },
        onError: (error) => {
          console.error("Error creating job definition from template:", error);
        }
      });
      // Stub for saving a new preset
      console.log("Saving new jobDef:", modalInputValue);
    } else if (modalAction === "edit") {
      // Stub for editing an existing preset
      console.log("Editing preset:", selectedJobDef?.name, "to", modalInputValue);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const assetVersionResp = {
    ...assetVersion,
    owner_name: "",
    org_name: "",
    author_name: "",
    blurb: "",
    created: "",
    updated: "",
    contents: {
      files: Object.values(assetVersion.files),
    },
    tags: []
  } as AssetVersionResponse;

  const jobDefResp = useGetJobDefinition(assetVersion.asset_id, assetVersion.version.map(String));

  useEffect(() => {
    const newData = jobDefResp.data || [];
    if (jobDefResp.isSuccess) {
      setJobDefs((prev) => {
        if (prev) {
          const newJobDefs = newData.filter(
            (item) => !prev.some((prevItem) => prevItem.job_def_id === item.job_def_id)
          );
          return newJobDefs ? [...prev, ...newJobDefs] : prev;
        } else {
          return newData;
        }
      });
    }
  }, [jobDefResp.data]);

  useEffect(() => {
    if (!selectedHda) {
      setJobDefs(null);
    }
    if (selectedHda) {
      setJobDefs(jobDefResp.data?.filter(
        (item) => item.source.file_id === selectedHda.file_id
       ) || null);
    }
  }, [selectedHda]);

  useEffect(() => {
    if (!jobDefs || jobDefs.length == 0) {
      setSelectedJobDef(null);
    } else if (newJobDefId) {
      const selectedJobDef = jobDefs.find((jobDef) => jobDef.job_def_id === newJobDefId);
      setSelectedJobDef(selectedJobDef as JobDefinition);
    } else {
      setSelectedJobDef(jobDefs[0]);
    }
  }, [jobDefs]);

  useEffect(() => {
    if (selectedJobDef) {
      setNewJobDefId(null);

      setParamValues(selectedJobDef.params_schema.default || {});
      setHidden(selectedJobDef.params_schema.hidden || {});
    }
  }, [selectedJobDef]);

      // Filter files to find "HDA" files (HDA files with .hda extension but not .nc or .lc)
  const hdaFiles = Object.values(assetVersion.files).filter(
    (file) =>
      file.file_name.endsWith(".hda") &&
      !file.file_name.endsWith(".nc.hda") &&
      !file.file_name.endsWith(".lc.hda")
  ) as AssetVersionContent[];

  const handleSelectHda = (hda: AssetVersionContent) => {
    setSelectedHda(hda);
  };
  
  const handleSelectJobDef = (_ignore: any, jobDefId: string | null) => {
    if (jobDefId) {
      const selectedJobDef = jobDefResp.data?.find((jobDef) => jobDef.job_def_id === jobDefId);
      setSelectedJobDef(selectedJobDef || null);
    } else {
      setSelectedJobDef(null);
    }
  };

  const handleClear = () => {
    setParamValues({});
    setHidden({});
  };

  const FilteringParmFactory: React.FC<ParmFactoryProps> = React.useCallback((props) => {
    

    return (
      <div 
        style={{
          border: '1px solid #888',          
        }}>
        
        { props.parmTemplate.param_type != "file" &&
        <input
          style={{ float:"left", margin: '2px' }}
          type="checkbox"
          checked={!(props.parmTemplate.name in hidden) && !hidden[props.parmTemplate.name]}
          onChange={(e) => {
            setHidden((prev) => {
              if (!e.target.checked) 
                return ({ 
                  ...prev, 
                  [props.parmTemplate.name]: true 
                });
              else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [props.parmTemplate.name]: _v, ...rest } = prev;
                return rest;
              }
            });
          }}
        />
       }
        <DefaultParmFactory
          {...props}
        />
      </div>
      
    );
  },[hidden])
  
  const FilteredParmFactory: React.FC<ParmFactoryProps> = React.useCallback((props) => {

    return (
      <div 
        style={{
          display: (hidden[props.parmTemplate.name] ? 'none' : 'block'),
        }}>
        <DefaultParmFactory
          {
            ...props
          }
        />
      </div>
      
    );
  },[hidden])
  
  return (
    <>
      {/* Modal for inputting preset name */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <ModalDialog>
          <Typography level="h4">
            {modalAction === "new" ? "Create New Preset" : "Edit Preset Name"}
          </Typography>
          <Input
            value={modalInputValue}
            onChange={(e) => setModalInputValue(e.target.value)}
            placeholder="Enter preset name"
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button onClick={handleModalSave}>Ok</Button>
          </Box>
        </ModalDialog>
      </Modal>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        mx: 2,
        flexDirection: 'column',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'rows',
          gap:2,
          width: '100%',
        }}>
          <FormLabel>
            Generator:
          </FormLabel>
          <Select
            variant="soft"
            name="generator_select"
            placeholder="Select Generator"
            size="md"
            sx={{ minWidth: 200 }}
            value={selectedHda}
            multiple={false}
            onChange={(_, newValue) => {
              handleSelectHda( newValue as AssetVersionContent);
            }}
          >
            {hdaFiles.map((hda) => (
              <Option key={hda.file_id} value={hda}>
                {hda.file_name}
              </Option>
            ))}
          </Select>
        </Box>
        {/* 
          Preset Editor 
          Add option to save current presets. Needs a text input
          for the name of the preset and a button to save it.
          Add a dropdown to select a preset to load. 
          TO handle editing existing presets, add a save as button
          so that current preset can be saved as a new preset.
        */}
        { selectedHda && (
          <Box display={"flex"} flexDirection="column" gap={2} width="100%">
            <Box sx={{
              display: 'flex',
              flexDirection: 'rows',
              gap: 2,
              width: '100%',
            }}>
              <FormLabel>
                Preset Editor:
              </FormLabel>
              <Select
                variant="soft"
                name="generator_select"
                placeholder="Select a Preset to Edit"
                onChange={handleSelectJobDef}
                sx={{ minWidth: 200 }}
                value={selectedJobDef?.job_def_id || jobDefResp.data?.[0]?.job_def_id}
                multiple={false}
              >
                {jobDefResp.data?.filter(
                  (item) => item.source.file_id === selectedHda.file_id
                 )?.map((jd) => (
                  <Option key={jd.job_def_id} value={jd.job_def_id}>
                    {jd.name}
                  </Option>
                ))}
              </Select>
              <Button 
                sx={{ padding: 1 }}
                onClick={() => window.alert("Not implemented yet")}
                disabled={
                  Object.keys(paramValues || {}).length === 0
                  || !selectedJobDef
                }
                >Save
              </Button>
              <Button 
                sx={{ padding: 1 }}
                onClick={() => window.alert("Not implemented yet")}
                disabled={!selectedJobDef}
              >
                Edit Name
              </Button>
              <Button 
                sx={{ padding: 1, bgcolor: 'red' }}
                onClick={() => window.alert("Not implemented yet")}
                disabled={
                  Object.keys(paramValues || {}).length === 0
                  || !selectedJobDef
                }
                >Delete
              </Button>
              
              <Button 
                sx={{ padding: 1 }}
                onClick={() => handleOpenModal("new")}
              >
                Save As New...
              </Button>
              <Button 
                onClick={handleClear}
                >Clear
              </Button>
            </Box>
          </Box>
        )}
        <Box sx={{
          display: 'flex',
          flexDirection: 'rows',
          gap: 0,
          width: '100%',
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}>
            { selectedJobDef ? 
              <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0,
              }}
              >
              <ParmFactoryProvider value={FilteringParmFactory as React.FC<ParmFactoryProps>}>
                <SceneControls
                  style={{zoom: 0.8, width: 390}}
                  jobDefinition={selectedJobDef as JobDefinition}
                  assetVersion={assetVersionResp}
                  />
              </ParmFactoryProvider>
              <ParmFactoryProvider value={FilteredParmFactory as React.FC<ParmFactoryProps>}>
                <SceneControls
                  style={{zoom: 0.8, width: 390}}
                  jobDefinition={selectedJobDef as JobDefinition}
                  assetVersion={assetVersionResp}
                  />
              </ParmFactoryProvider>
              </div>
            :
              <div style={{width: '100%'}}>
                <Typography level="h4">Select a Job Generator to load Preset Editor</Typography>
              </div>
            }
          </Box>
          <Box sx={{
            display: 'flex',
            flex: '1 1 auto',
            gap: 0,
            width: '100%',
          }}>
              
          {/* Preset Editor */}
          {selectedHda && (
            <div style={{ 
              width: "100%",
              height: "100%"
              }}> {/* Ensure the child div also fills the parent */}
              <textarea
                value={JSON.stringify(paramValues, null, 2) + JSON.stringify(hidden, null, 2)}
                style={{ 
                  width: "100%",
                  height: "100%",
                  fontFamily: "monospace" 
                }}
              />
              <br />
            </div>
          )}
          </Box>
        </Box>    
      </Box>
    </>
  );
};


