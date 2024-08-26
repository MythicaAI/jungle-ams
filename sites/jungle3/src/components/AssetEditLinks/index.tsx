import React from "react";
import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Stack,
  Typography,
} from "@mui/joy";
import { LucideCircleMinus, LucidePlusCircle } from "lucide-react";
import { useAssetVersionStore } from "../../stores/assetVersionStore";

export const AssetEditLinks = () => {
  const { setLinks, links } = useAssetVersionStore();
  const [inputs, setInputs] = React.useState(
    links && links.length > 0 ? links : [{ name: "linkInput-0", value: "" }],
  );

  const addInput = () => {
    setInputs([...inputs, { name: `linkInput-${inputs.length}`, value: "" }]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newInputs = [...inputs];
    newInputs[index].value = event.target.value;
    setInputs(newInputs);
  };

  React.useEffect(() => {
    setLinks(inputs);
  }, [inputs]);

  return (
    <div>
      <FormLabel sx={{ mb: "5px" }}>
        <IconButton type="button" onClick={addInput}>
          <LucidePlusCircle />
        </IconButton>
        <Typography variant="soft" level="title-md" fontWeight="bold">
          Links
        </Typography>
      </FormLabel>
      <Stack gap="10px">
        {inputs.map((input, index) => (
          <Stack key={index} direction="row" width="100%" gap="5px">
            <FormControl sx={{ width: "100%" }}>
              <Input
                name={input.name}
                variant="outlined"
                placeholder="Enter..."
                value={input.value}
                onChange={(event) => handleInputChange(index, event)}
              />
            </FormControl>
            <IconButton type="button" onClick={() => removeInput(index)}>
              <LucideCircleMinus />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </div>
  );
};
