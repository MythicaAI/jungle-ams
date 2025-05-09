import React, { useEffect } from "react";
import { Select, Option, Box } from "@mui/joy";
import { useSceneStore } from "scenetalk";
import { JobDefinition } from "@queries/packages/types";
import { AssetVersionResponse } from "types/apiTypes";

type GeneratorSelectorProps = {
  jobDefinitions: JobDefinition[] | undefined;
  assetVersion: AssetVersionResponse | null;
};

const GeneratorSelector: React.FC<GeneratorSelectorProps> = ({ 
  jobDefinitions, 
  assetVersion 
}) => {
  const { selectedHdaId, setSelectedHdaId } = useSceneStore();

  const hdaFiles = assetVersion?.contents?.files.filter((file) =>
    file.file_name.includes(".hda"),
  );

  useEffect(() => {
    if (!selectedHdaId && hdaFiles && hdaFiles.length > 0) {
        setSelectedHdaId(hdaFiles[0].file_id);
    }
  }, [hdaFiles]);

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
          setSelectedHdaId(newValue || "");
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