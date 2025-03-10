import { Box, Button, Typography } from "@mui/joy";
import { useState, ChangeEvent } from "react";
import { useSceneStore } from "@store/sceneStore";

const SceneControls = () => {
  // Get state and actions from the store
  const {
    params,
    updateParam,
    wsStatus,
    generateTime,
    isWireframe,
    toggleWireframe,
    showLogWindow,
    toggleLogWindow,
    setExportFormat
  } = useSceneStore();

  // Local state for slider values to prevent immediate regeneration
  const [lengthValue, setLengthValue] = useState(params.length);
  const [radiusValue, setRadiusValue] = useState(params.radius);
  const [numsidesValue, setNumsidesValue] = useState(params.numsides);

  // Handle changes with debouncing to avoid too many WebSocket requests
  const handleSliderChange = (key: string, setter: (value: number) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setter(value);
  };

  // Update actual parameters on slider release
  const handleSliderCommit = (key: keyof typeof params, value: number) => {
    updateParam(key, value);
  };

  // Handle export format selection
  const handleExport = (format: string) => {
    setExportFormat(format);
  };

  return (
    <Box
      sx={{
        width: 250,
        padding: "15px",
        backgroundColor: "#1e1e1e",
        borderRight: "1px solid #333",
        overflowY: "auto",
        color: "#e0e0e0",
        display: "flex",
        flexDirection: "column"
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
          backgroundColor: wsStatus === "connected" ? "#4CAF50" : "#f44336",
          color: "white"
        }}
      >
        {wsStatus === "connected" ? "Connected" : "Disconnected"}
      </Box>

      {/* Generate Time */}
      <Box
        sx={{
          textAlign: "center",
          marginBottom: "25px",
          fontSize: "0.9em",
          color: "#888"
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
              borderRadius: "3px"
            }}
          >
            {showLogWindow ? "Hide Log" : "Show Log"}
          </Button>
        </Box>
        <Box sx={{ clear: "both" }}></Box>
      </Box>

      {/* Parameters Section Header */}
      <Box
        sx={{
          backgroundColor: "#2d2d2d",
          padding: "8px",
          margin: "-15px -15px 15px -15px",
          borderBottom: "1px solid #333"
        }}
      >
        <Typography
          level="h3"
          sx={{ margin: 0, textAlign: "center", color: "#e0e0e0" }}
        >
          Parameters
        </Typography>
      </Box>

      {/* Length Slider */}
      <Box sx={{ marginBottom: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "80px" }}>Length:</span>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={lengthValue}
            onChange={handleSliderChange("length", setLengthValue)}
            onMouseUp={() => handleSliderCommit("length", lengthValue)}
            onTouchEnd={() => handleSliderCommit("length", lengthValue)}
            style={{ flex: 1, width: "150px" }}
          />
          <span style={{ width: "40px", textAlign: "right" }}>
            {lengthValue.toFixed(1)}
          </span>
        </Box>
      </Box>

      {/* Radius Slider */}
      <Box sx={{ marginBottom: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "80px" }}>Radius:</span>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={radiusValue}
            onChange={handleSliderChange("radius", setRadiusValue)}
            onMouseUp={() => handleSliderCommit("radius", radiusValue)}
            onTouchEnd={() => handleSliderCommit("radius", radiusValue)}
            style={{ flex: 1, width: "150px" }}
          />
          <span style={{ width: "40px", textAlign: "right" }}>
            {radiusValue.toFixed(1)}
          </span>
        </Box>
      </Box>

      {/* Sides Slider */}
      <Box sx={{ marginBottom: "20px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "80px" }}>Sides:</span>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={numsidesValue}
            onChange={handleSliderChange("numsides", setNumsidesValue)}
            onMouseUp={() => handleSliderCommit("numsides", numsidesValue)}
            onTouchEnd={() => handleSliderCommit("numsides", numsidesValue)}
            style={{ flex: 1, width: "150px" }}
          />
          <span style={{ width: "40px", textAlign: "right" }}>
            {numsidesValue}
          </span>
        </Box>
      </Box>

      {/* Wireframe Toggle */}
      <Box
        sx={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
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
            color: "#e0e0e0"
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
              transition: "background-color 0.3s"
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
                transition: "transform 0.3s"
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
            margin: "-15px -15px 15px -15px",
            borderBottom: "1px solid #333"
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
              background: "#444"
            }
          }}
        >
          Download OBJ
        </Button>
      </Box>
    </Box>
  );
};

export default SceneControls;
