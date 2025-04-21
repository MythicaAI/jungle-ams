import {
    Box,
    Button,
    Typography,
    Select,
    Option,
    CircularProgress
} from "@mui/joy";
import React, { useEffect, useCallback } from "react";
import { useSceneStore } from "@store/sceneStore";
import { Engine } from "@babylonjs/core"
import "@babylonjs/node-geometry-editor";
import { dictionary, hou, ParmGroup } from "houdini-ui";
import { AssetVersionContent } from "types/apiTypes";

const getScene = () => Engine.LastCreatedScene;

type Props = {
    width: number;
};

const SceneControls: React.FC<Props> = ({ width }) => {
    const {
        assetVersion,
        jobDefinitions,
        selectedHdaId,
        setSelectedHdaId,
        setInputFile,
        paramValues,
        setParamValues,
        wsStatus,
        generateTime,
        isWireframe,
        toggleWireframe,
        showLogWindow,
        toggleLogWindow,
        setExportFormat,
    } = useSceneStore();
    const scene = getScene()
    const inspector = scene?.debugLayer


    const selectedJobData = jobDefinitions?.find(
        (definition) => definition.source.file_id === selectedHdaId,
    );
        
    const parmTemplateGroup = React.useMemo(
        () => {
            const jobDef = jobDefinitions?.find(
                (definition) => definition.source.file_id === selectedHdaId,
            );
            return new hou.ParmTemplateGroup(
                jobDef?.params_schema.params_v2 as dictionary[],
            )
        }
        ,
        [selectedHdaId, jobDefinitions],
    );

    const inputFileParms = parmTemplateGroup.parm_templates.filter(
        (parm) =>
        parm.param_type === hou.parmTemplateType.File &&
        parm.name.startsWith("input"),
    );

    const hdaFiles = assetVersion?.contents?.files.filter((file) =>
        file.file_name.includes(".hda"),
      );

    const availableInputFiles =
        assetVersion?.contents?.files.filter(
        (file) =>
            file.file_name.endsWith(".usd") ||
            file.file_name.endsWith(".usz") ||
            file.file_name.includes(".glb") ||
            file.file_name.includes(".gltf") ||
            file.file_name.includes(".fbx") ||
            file.file_name.includes(".obj"),
        ) || [];

    const handleParmChange = useCallback(
        (formData: dictionary) => {
        setParamValues({
            ...paramValues,
            ...formData
        });
        },
        [paramValues,setParamValues],
    );        

    useEffect(() => {
        if (!selectedHdaId && hdaFiles && hdaFiles.length > 0) {
            setSelectedHdaId(hdaFiles[0].file_id);
        }
    }, [hdaFiles]);

    const toggleInpector = () => {
        if (inspector) {
            if (inspector.isVisible()) {
                inspector.hide()
            } else {
                inspector.show({
                    overlay: true,
                    embedMode: true,
                    enableClose: false,
                    enablePopup: false,
                });
            }
        }
    }

    // Handle export format selection
    const handleExport = (format: string) => {
        setExportFormat(format);
    };

    if (!assetVersion || !jobDefinitions )
        return <CircularProgress />;
    
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
                    <Button
                        onClick={toggleInpector}
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
                        Toggle Inspector
                    </Button>
                </Box>
                <Box sx={{ clear: "both" }}></Box>



                <Box sx={{ marginTop:"20px", padding: "10px", border: "1px solid #333", borderRadius: "4px", marginBottom: "20px" }}>
                    {hdaFiles && hdaFiles?.length > 1 ? (
                        <>
                        <Typography 
                            level="h4" 
                            fontSize="medium"
                            textAlign="left">
                            Select Generator
                        </Typography>
                        <Select
                            variant="soft"
                            name="org_id"
                            sx={{fontSize: "small"}}
                            placeholder={""}
                            value={selectedHdaId}
                            multiple={false}
                            onChange={(_, newValue) => {
                            setSelectedHdaId(newValue || "");
                            }}>

                            {hdaFiles.map((hda) => (
                                <Option key={hda.file_id} value={hda.file_id}>
                                    {
                                    jobDefinitions?.find(
                                        (definition) =>
                                        definition.source.file_id === hda.file_id,
                                    )?.name
                                    }
                                </Option>
                            ))}
                        </Select>
                        </>
                    ) : (
                        <Typography level="h4" textAlign="left">
                            {selectedJobData?.name}
                        </Typography>
                    )}
                    {availableInputFiles.length > 0 && (
                        <>
                            <Typography 
                                level="h4" 
                                fontSize="medium"
                                textAlign="left">
                                Input Files
                            </Typography>
                            {inputFileParms.map((parm) => (
                                <Select
                                key={parm.name}
                                variant="soft"
                                sx={{fontSize: "small"}}
                                name={parm.name}
                                placeholder={parm.label}
                                multiple={false}
                                onChange={(_, newValue) => {
                                    if (newValue === null) return;
                                    setInputFile(
                                        parm.name, 
                                        availableInputFiles.find(
                                            (file) => file.file_id === newValue,
                                        ) ?? {} as AssetVersionContent,
                                    )
                                }}
                                >
                                {availableInputFiles.map((file) => (
                                    <Option key={file.file_id} value={file.file_id}>
                                    {file.file_name}
                                    </Option>
                                ))}
                                </Select>
                            ))}
                        </>
                    )}
                </Box>
                <Box sx={{ marginTop:"20px", padding: "10px", border: "1px solid #333", borderRadius: "4px", marginBottom: "20px" }}>

                    <Typography level="h4" fontSize="medium" mb="12px" textAlign="left">
                        Params
                    </Typography>
                    <ParmGroup
                        data={ paramValues }
                        group={parmTemplateGroup as hou.ParmTemplateGroup}
                        onChange={handleParmChange}
                    />
                </Box>
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
                {["fbx", "obj", "usd", "glb"].map(format => (
                    <Button
                        key={format}
                        onClick={() => handleExport(format)}
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
                        Download {format.toUpperCase()}
                    </Button>
                ))}
            </Box>


        </Box>

    )
}

export default SceneControls;