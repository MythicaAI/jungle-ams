import {
  Box,
  Button,
  Typography,
  Select,
  Option,
  FormControl,
  FormLabel,
} from "@mui/joy";
import { FC, useState, ChangeEvent, useEffect } from "react";
import { useSceneStore, ParameterSlider } from "@store/sceneStore";

type Props = {
  width?: number;
  isAssetPage?: boolean;
};

const SceneControls: FC<Props> = ({ width, isAssetPage }) => {
  // Get state and actions from the store
  const {
    hdaSchemas,
    selectedHdaIndex,
    setSelectedHdaIndex,
    paramValues,
    updateParam,
    resetParams,
    wsStatus,
    generateTime,
    isWireframe,
    toggleWireframe,
    showLogWindow,
    toggleLogWindow,
    setExportFormat,
  } = useSceneStore();

  // Get the current HDA schema
  const currentSchema = hdaSchemas[selectedHdaIndex];

  // Local state for slider values to prevent immediate regeneration
  const [localParamValues, setLocalParamValues] = useState<{
    [key: string]: number;
  }>(paramValues);

  // Update local parameter values when selected HDA changes
  useEffect(() => {
    setLocalParamValues(paramValues);
  }, [paramValues, selectedHdaIndex]);

  // Handle HDA selection change
  const handleHdaChange = (_event: any, value: number | null) => {
    if (value !== null) {
      setSelectedHdaIndex(value);
    }
  };

  // Handle slider change
  const handleSliderChange =
    (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setLocalParamValues((prev) => ({
        ...prev,
        [key]: value,
      }));
      updateParam(key, value);
    };

  // Update actual parameters on slider release
  const handleSliderCommit = (key: string, value: number) => {
    updateParam(key, value);
  };

  // Handle export format selection
  const handleExport = (format: string) => {
    setExportFormat(format);
  };

  return (
    <Box
      sx={{
        width: width ?? 250,
        height: "100%",
        padding: "15px",
        backgroundColor: "#1e1e1e",
        borderRight: "1px solid #333",
        overflowY: "auto",
        color: "#e0e0e0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Connection Status */}
      <Box
        sx={{
          position: "relative",
          marginBottom: "15px",
          padding: "5px 10px",
          borderRadius: "4px",
          fontWeight: "bold",
          textAlign: "center",
          backgroundColor:
            wsStatus === "connected"
              ? "#4CAF50"
              : wsStatus === "reconnecting"
                ? "#FFA500"
                : "#f44336",
          color: "white",
        }}
      >
        {wsStatus === "connected"
          ? "Connected"
          : wsStatus === "reconnecting"
            ? "Reconnecting..."
            : "Disconnected"}
      </Box>

      {/* Generate Time */}
      <Box
        sx={{
          textAlign: "center",
          marginBottom: "25px",
          fontSize: "0.9em",
          color: "#888",
        }}
      >
        <span>
          Last update:{" "}
          <span style={{ color: "#e0e0e0", fontWeight: 500 }}>
            {generateTime} ms
          </span>
        </span>
        <Box sx={{ float: "right" }}>
          <Button
            onClick={toggleLogWindow}
            size="sm"
            variant="outlined"
            color="neutral"
            sx={{
              padding: "2px 8px",
              backgroundColor: "#333",
              border: "1px solid #555",
              color: "#e0e0e0",
              cursor: "pointer",
              borderRadius: "3px",
            }}
          >
            {showLogWindow ? "Hide Log" : "Show Log"}
          </Button>
        </Box>
        <Box sx={{ clear: "both" }}></Box>
      </Box>

      {/* HDA Selection */}
      {!isAssetPage && (
        <FormControl sx={{ mb: 3 }}>
          <FormLabel sx={{ color: "#e0e0e0" }}>Select Generator</FormLabel>
          <Select
            value={selectedHdaIndex}
            onChange={handleHdaChange}
            variant="outlined"
            color="neutral"
            sx={{
              bgcolor: "#333",
              "& .MuiSelect-indicator": { color: "#e0e0e0" },
            }}
          >
            {hdaSchemas.map((schema, index) => (
              <Option key={index} value={index}>
                {schema.name}
              </Option>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Parameters Section Header */}
      <Box
        sx={{
          backgroundColor: "#2d2d2d",
          padding: "8px",
          margin: "0 -15px 15px -15px",
          borderBottom: "1px solid #333",
        }}
      >
        <Typography
          level="h3"
          sx={{ margin: 0, textAlign: "center", color: "#e0e0e0" }}
        >
          Parameters
        </Typography>
      </Box>

      {/* Dynamic Parameter Sliders */}
      <Box sx={{ mb: 3 }}>
        {Object.entries(currentSchema.parameters).map(([key, config]) => {
          if (config.type === "hidden") return null;

          const sliderConfig = config as ParameterSlider;

          return (
            <Box key={key} sx={{ marginBottom: "20px" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "100px" }}>{sliderConfig.label}:</span>
                <input
                  type="range"
                  min={sliderConfig.min}
                  max={sliderConfig.max}
                  step={sliderConfig.step}
                  value={
                    localParamValues[key] !== undefined
                      ? localParamValues[key]
                      : sliderConfig.default
                  }
                  onChange={handleSliderChange(key)}
                  onMouseUp={() =>
                    handleSliderCommit(key, localParamValues[key])
                  }
                  onTouchEnd={() =>
                    handleSliderCommit(key, localParamValues[key])
                  }
                  style={{ flex: 1, width: "100px" }}
                />
                <span style={{ width: "40px", textAlign: "right" }}>
                  {localParamValues[key]?.toFixed(
                    sliderConfig.step < 1 ? 1 : 0,
                  )}
                </span>
              </Box>
            </Box>
          );
        })}

        <Button
          onClick={resetParams}
          fullWidth
          size="sm"
          variant="outlined"
          color="neutral"
          sx={{
            mb: 2,
            padding: "6px",
            backgroundColor: "#333",
            border: "1px solid #555",
            color: "#e0e0e0",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Reset Parameters
        </Button>
      </Box>

      {/* Wireframe Toggle */}
      <Box
        sx={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          type="checkbox"
          id="wireframeToggle"
          checked={isWireframe}
          onChange={toggleWireframe}
          style={{ display: "none" }}
        />
        <label
          htmlFor="wireframeToggle"
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            color: "#e0e0e0",
          }}
        >
          <span
            style={{
              position: "relative",
              display: "inline-block",
              width: "40px",
              height: "20px",
              backgroundColor: isWireframe ? "#4CAF50" : "#484848",
              borderRadius: "20px",
              marginRight: "10px",
              transition: "background-color 0.3s",
            }}
          >
            <span
              style={{
                content: '""',
                position: "absolute",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: "white",
                top: "2px",
                left: isWireframe ? "22px" : "2px",
                transition: "transform 0.3s",
              }}
            ></span>
          </span>
          Wireframe
        </label>
      </Box>

      {/* Export Section */}
      <Box sx={{ marginTop: "80px" }}>
        <Box
          sx={{
            backgroundColor: "#2d2d2d",
            padding: "8px",
            margin: "0 -15px 15px -15px",
            borderBottom: "1px solid #333",
          }}
        >
          <Typography
            level="h3"
            sx={{ margin: 0, textAlign: "center", color: "#e0e0e0" }}
          >
            Export
          </Typography>
        </Box>
        <Button
          onClick={() => handleExport("obj")}
          fullWidth
          sx={{
            marginBottom: "10px",
            padding: "12px",
            background: "#333",
            border: "1px solid #555",
            color: "#e0e0e0",
            cursor: "pointer",
            borderRadius: "4px",
            fontSize: "14px",
            transition: "background-color 0.2s",
            "&:hover": {
              background: "#444",
            },
          }}
        >
          Download OBJ
        </Button>
      </Box>
    </Box>
  );
};

export default SceneControls;
