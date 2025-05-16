import React, { useEffect } from "react";
import { Select, Option, Box, FormLabel } from "@mui/joy";
import { useSceneStore } from "scenetalk";
import { AssetVersionResponse } from "types/apiTypes";
import { JobDefinition } from "@queries/packages/types";

type GeneratorSelectorProps = {
  assetVersion: AssetVersionResponse | null;
  jobDefinitions?: JobDefinition[];
};

const GeneratorSelector: React.FC<GeneratorSelectorProps> = ({ 
  assetVersion,
  jobDefinitions
}) => {
  const { 
    selectedHdaId, 
    setSelectedHdaId, 
    setDependencyFileIds,
    selectedJobDef,
    setSelectedJobDef,
    setParamValues
  } = useSceneStore();

  const hdaFiles = assetVersion?.contents?.files.filter((file) =>
    file.file_name.includes(".hda"),
  );

  const updateHdaAndDependencies = (newHdaId: string) => {
    setSelectedHdaId(newHdaId);
    
    if (jobDefinitions?.length) {
      const jobDef = jobDefinitions.find(
        (definition) => definition.source.file_id === newHdaId
      );
      
      if (jobDef) {
        setSelectedJobDef(jobDef);
        
        const dependencies = jobDef.params_schema.params['dependencies']?.default as string[] || [];
        setDependencyFileIds(dependencies);        
        setParamValues(jobDef.params_schema.default);
      }
    }
  };
  
  const handlePresetChange = (jobDefId: string | null) => {
    if (jobDefId && jobDefinitions) {
      const jobDef = jobDefinitions.find(
        (definition) => definition.job_def_id === jobDefId
      ) || null;
      
      if (jobDef) {
        setSelectedJobDef(jobDef);
        setParamValues(jobDef.params_schema.default);
      }
    }
  };

  useEffect(() => {
    if (!selectedHdaId && hdaFiles?.length && jobDefinitions?.length) {
      updateHdaAndDependencies(hdaFiles[0].file_id);
    }
  }, [hdaFiles, jobDefinitions]);

  if (!hdaFiles || hdaFiles.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ 
      display: "flex", 
      flexWrap: "wrap",
      gap: 2,
      justifyContent: "center",
      alignItems: "center"
    }}>
      {/* Generator Selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormLabel>Generator:</FormLabel>
        <Select
          variant="soft"
          name="generator_select"
          placeholder="Select Generator"
          size="md"
          sx={{ 
            maxWidth: { xs: 240, md: 400 }
          }}
          value={selectedHdaId}
          multiple={false}
          onChange={(_, newValue) => {
            updateHdaAndDependencies(newValue || "");
          }}
        >
          {hdaFiles.map((hda) => (
            <Option key={hda.file_id} value={hda.file_id}>
              {hda.file_name}
            </Option>
          ))}
        </Select>
      </Box>
      
      {/* Preset Selector */}
      {selectedHdaId && jobDefinitions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormLabel>Preset:</FormLabel>
          <Select
            variant="soft"
            name="preset_select"
            placeholder="Select a Preset"
            onChange={(_, value) => {
              handlePresetChange(value);
            }}
            sx={{ 
              maxWidth: { xs: 240, md: 400 }
            }}
            value={selectedJobDef?.job_def_id || jobDefinitions.filter(
              item => item.source.file_id === selectedHdaId
            )[0]?.job_def_id}
            multiple={false}
          >
            {jobDefinitions
              .filter(item => item.source.file_id === selectedHdaId)
              .map((jd) => (
                <Option key={jd.job_def_id} value={jd.job_def_id}>
                  {jd.name}
                </Option>
              ))
            }
          </Select>
        </Box>
      )}
    </Box>
  );
};

export default GeneratorSelector; 