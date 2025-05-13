import React, { useEffect } from "react";
import { Select, Option, Box } from "@mui/joy";
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
  const { selectedHdaId, setSelectedHdaId, setDependencyFileIds } = useSceneStore();

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
        const dependencies = jobDef.params_schema.params['dependencies']?.default as string[] || [];
        setDependencyFileIds(dependencies);
      }
    }
  };

  useEffect(() => {
    if (hdaFiles?.length && jobDefinitions?.length) {
      const defaultHdaId = hdaFiles[0].file_id;
      const newHdaId = !selectedHdaId ? defaultHdaId : selectedHdaId;
      
      const hdaExists = hdaFiles.some(file => file.file_id === selectedHdaId);
      if (!selectedHdaId || !hdaExists) {
        updateHdaAndDependencies(newHdaId);
      }
    }
  }, [hdaFiles, selectedHdaId, updateHdaAndDependencies, jobDefinitions]);

  if (!hdaFiles || hdaFiles.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      mx: 2
    }}>
      <Select
        variant="soft"
        name="generator_select"
        placeholder="Select Generator"
        size="md"
        sx={{ minWidth: 200 }}
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
  );
};

export default GeneratorSelector; 