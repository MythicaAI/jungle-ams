import React, { useEffect, useState } from "react";
import { useAssetVersionStore } from "../../stores/assetVersionStore";
import { AssetVersionContent, AssetVersionResponse } from "types/apiTypes";
import { JobDefinition, JobDefinitionTemplate } from "@queries/packages/types";
import { Box, Button, FormLabel, Option, Select, Typography, Modal, ModalDialog, Input } from "@mui/joy";
import SceneControls from "@components/BabylonViewer/SceneControls";
import { useSceneStore, SceneTalkConnector } from "scenetalk";
import { ParmFactoryProvider, ParmFactoryProps, DefaultParmFactory } from "houdini-ui";
import { useCreateJobDefinitionFromTemplate, useGetJobDefinition, useUpdateJobDefinition, useDeleteJobDefinition } from "@queries/packages";
import SceneViewer from "@components/BabylonViewer/SceneViewer";
import { StatusBar } from "@components/StatusBar";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";

export const AssetEditPresets: React.FC = () => {
  const assetVersion = useAssetVersionStore();

  // Filter files to find "HDA" files (HDA files with .hda extension but not .nc or .lc)
  const operatorFiles = Object.values(assetVersion.files).filter(
    (file) =>
      file.file_name.endsWith(".hda") ||
      file.file_name.endsWith(".awpy")

  ) as AssetVersionContent[];

  const [selectedOperator, setSelectedOperator] = useState<AssetVersionContent | null>(null);
  const [newJobDefId, setNewJobDefId] = useState<string | null>(null);
  const [selectedJobDef, setSelectedJobDef] = useState<JobDefinition | null>(null);
  const [jobDefs, setJobDefs] = useState<JobDefinition[] | null>(null);
  const [hidden, setHidden] = useState<{[key: string]: boolean}>({});  
  

  const { 
    paramValues, 
    setParamValues,
    setSelectedHdaId,
    setDependencyFileIds,
    reset,
    resetSelection
  } = useSceneStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInputValue, setModalInputValue] = useState("");

  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'raw'>('edit');
  const [isSidepanelOpen, setIsSidepanelOpen] = useState(true);


  const editJobDef = useUpdateJobDefinition();
  const deleteJobDef = useDeleteJobDefinition();
  const newJobDef = useCreateJobDefinitionFromTemplate();

  const handleModalSave = () => {

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

    newJobDef.mutate({
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

    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const savePreset = () => {
    if (!selectedJobDef) {
      console.error("No job definition selected");
      return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { job_def_id, owner_id, ...template } = structuredClone(selectedJobDef);
    template.params_schema.default = paramValues;
    template.params_schema.hidden = hidden;

    editJobDef.mutate({
      jobDefId: job_def_id,
      job_def: template as JobDefinitionTemplate
    }, {
      onSuccess: (_data) => {
        jobDefResp.refetch();
        setTimeout(() => setNewJobDefId(_data.job_def_id), 100);
      },
      onError: (error) => {
        console.error("Error updating job definition:", error);
      }
    });
  };
  const deletePreset = () => {
    if (!selectedJobDef) {
      console.error("No job definition selected");
      return;
    }
    // ask for confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this job definition?")) {
      return;
    }
    deleteJobDef.mutate(selectedJobDef.job_def_id, {
      onSuccess: () => {
        setNewJobDefId(null);
        jobDefResp.refetch();
      },
      onError: (error) => {
        console.error("Error deleting job definition:", error);
      }
    });
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
    if (!selectedOperator) {
      setJobDefs(null);
    }
    if (selectedOperator) {
      setJobDefs(jobDefResp.data?.filter(
        (item) => item.source.file_id === selectedOperator.file_id
       ) || null);
    }
  }, [selectedOperator]);

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

  // Fully reset store when page mounts
  useEffect(() => {
    resetSelection();
  }, [resetSelection]);

  const handleSelectOperator = (operator: AssetVersionContent) => {
    reset();
    setSelectedOperator(operator);

    if (operator && operator.file_name.endsWith(".hda")) {
      setSelectedHdaId(operator.file_id);
    }

    if (jobDefResp.data?.length) {
      const jobDef = jobDefResp.data.find(
        (definition) => definition.source.file_id === operator.file_id
      );
      
      if (jobDef) {
        const dependencies = jobDef.params_schema.params['dependencies']?.default as string[] || [];
        setDependencyFileIds(dependencies);
      }
    }
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
            "Create New Preset"
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

        {/*Generator Selector */}
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
            value={selectedOperator}
            multiple={false}
            onChange={(_, newValue) => {
              handleSelectOperator( newValue as AssetVersionContent);
            }}
          >
            {operatorFiles.map((hda) => (
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

        { /* Preset Selector and Buttons */ }
        { selectedOperator && (
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
                  (item) => item.source.file_id === selectedOperator.file_id
                )?.map((jd) => (
                  <Option key={jd.job_def_id} value={jd.job_def_id}>
                    {jd.name}
                  </Option>
                ))}
              </Select>
                <Button 
                sx={{ padding: 1 }}
                onClick={savePreset}
                disabled={
                  !selectedJobDef || 
                  (JSON.stringify(paramValues) === JSON.stringify(selectedJobDef?.params_schema.default) &&
                   JSON.stringify(hidden) === JSON.stringify(selectedJobDef?.params_schema.hidden))
                }
                >Save
                </Button>
              <Button 
                sx={{ padding: 1, bgcolor: 'red' }}
                onClick={deletePreset}
                disabled={
                  !selectedJobDef || 
                  (JSON.stringify(paramValues) === JSON.stringify(selectedJobDef?.params_schema.default) &&
                   JSON.stringify(hidden) === JSON.stringify(selectedJobDef?.params_schema.hidden))
                }
                >Delete
              </Button>
              
              <Button 
                sx={{ padding: 1 }}
                onClick={() => setIsModalOpen(true)}
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
          flexDirection: 'row',
          gap: 0,
          width: '100%',
          height: 'calc(min(640px, 100vh))',
          position: 'relative',
          minHeight: '600px',
        }}>
          {/* Toggle button for sidepanel */}
          <Button
            color="neutral"
            variant="soft"
            sx={{
              position: "absolute",
              left: isSidepanelOpen ? "320px" : "5px",
              top: "5px",
              zIndex: 10,
              minWidth: "32px",
              width: "32px",
              height: "32px",
              padding: 0,
            }}
            onClick={() => setIsSidepanelOpen(!isSidepanelOpen)}
          >
            {isSidepanelOpen ? 
              <LucideChevronLeft height="20px" width="20px" /> : 
              <LucideChevronRight height="20px" width="20px" />
            }
          </Button>
          
          {/* Collapsible Panel */}
          <Box
            sx={{
              left: isSidepanelOpen ? "0" : "-510px",
              width: isSidepanelOpen ? "510px" : "0px",
              position: "relative",
              height: "100%",
              zIndex: 5,
              transition: "all 0.3s ease",
              backgroundColor: "background.surface",
              boxShadow: isSidepanelOpen ? "md" : "none",
              borderRight: isSidepanelOpen ? "1px solid" : "none",
              borderColor: "divider",
              visibility: isSidepanelOpen ? "visible" : "hidden",
              overflow: "auto",
            }}
          >
            { selectedOperator && selectedJobDef ? 
              <div style={{width: '100%', height: '554px'}}>
                {/* Tab Selection */}
                <Box sx={{ 
                  display: 'flex', 
                  borderBottom: '1px solid #ccc',
                  mb: 1
                }}>
                  <Button 
                    variant={activeTab === 'edit' ? 'solid' : 'plain'} 
                    onClick={() => setActiveTab('edit')}
                    sx={{ borderRadius: '4px 4px 0 0' }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant={activeTab === 'preview' ? 'solid' : 'plain'} 
                    onClick={() => setActiveTab('preview')}
                    sx={{ borderRadius: '4px 4px 0 0' }}
                  >
                    Preview
                  </Button>
                  <Button 
                    variant={activeTab === 'raw' ? 'solid' : 'plain'} 
                    onClick={() => setActiveTab('raw')}
                    sx={{ borderRadius: '4px 4px 0 0' }}
                  >
                    Raw
                  </Button>
                </Box>
                
                {/* Tab Content */}
                <Box sx={{ display: activeTab === 'edit' ? 'block' : 'none', width: '100%', height: '100%', overflow: 'auto' }}>
                  <ParmFactoryProvider value={FilteringParmFactory as React.FC<ParmFactoryProps>}>
                    <SceneControls
                      style={{zoom: 0.8, width: 390}}
                      jobDefinition={selectedJobDef as JobDefinition}
                      assetVersion={assetVersionResp}
                      />
                  </ParmFactoryProvider>
                </Box>
                
                <Box sx={{ display: activeTab === 'preview' ? 'block' : 'none', width: '100%', height: '100%', overflow: 'auto'}}>
                  <ParmFactoryProvider value={FilteredParmFactory as React.FC<ParmFactoryProps>}>
                    <SceneControls
                      style={{zoom: 0.8, width: 390}}
                      jobDefinition={selectedJobDef as JobDefinition}
                      assetVersion={assetVersionResp}
                      />
                  </ParmFactoryProvider>
                </Box>
                
                <Box sx={{ display: activeTab === 'raw' ? 'block' : 'none', width: '100%', height: '100%' }}>
                  <textarea
                    value={JSON.stringify({
                        default: {...paramValues},
                        hidden: {...hidden},
                      }, null, 2)}
                    onChange={() => {}}
                    style={{ 
                      width: "100%",
                      height: "100%",
                      fontFamily: "monospace" 
                    }}
                    readOnly
                  />
                </Box>
              </div>
            :
              <div style={{width: '100%'}}>
                <Typography level="h4">Select a Job Generator to load Preset Editor</Typography>
              </div>
            }
          </Box>

          {/* Main content */}
          <Box sx={{ 
            width: '100%',
            height: '100%',
            transition: "margin-left 0.3s ease"
          }}>
            <SceneTalkConnector />
            <SceneViewer packageName={assetVersion?.name as string} />
            <StatusBar />
          </Box>
        </Box>
      </Box>

    </>
  );
};


