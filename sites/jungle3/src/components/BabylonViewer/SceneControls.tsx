import {
    Box,
    Typography,
    Select,
    Option,
    CircularProgress
} from "@mui/joy";
import React, { useCallback } from "react";
import { useSceneStore } from "scenetalk";
import { dictionary, hou, ParmGroup } from "houdini-ui";
import { AssetVersionResponse, AssetVersionContent } from "types/apiTypes";
import { JobDefinition } from "@queries/packages/types";

type Props = {
    style: React.CSSProperties;
    jobDefinition: JobDefinition;
    assetVersion: AssetVersionResponse | null;
};

const VALID_MESH_EXTENSIONS = ['.usd', '.usdz', '.glb', '.gltf', '.fbx', '.obj'];

const isValidMeshFile = (fileName: string): boolean => {
    const lowerFileName = fileName.toLowerCase();
    return VALID_MESH_EXTENSIONS.some(ext => lowerFileName.endsWith(ext));
};

const SceneControls: React.FC<Props> = ({ style, jobDefinition,assetVersion }) => {
    const {
        selectedHdaId,
        setInputFile,
        paramValues,
        setParamValues,
        setFileUpload,
    } = useSceneStore();        
    const parmTemplateGroup = React.useMemo(
        () => {
            return new hou.ParmTemplateGroup(
                jobDefinition?.params_schema.params_v2 as dictionary[],
            )
        }
        ,
        [selectedHdaId, jobDefinition],
    );

    const inputFileParms = parmTemplateGroup.parm_templates.filter(
        (parm) =>
        parm.param_type === hou.parmTemplateType.File &&
        parm.name.startsWith("input"),
    );

    const [availableInputFiles, setAvailableInputFiles] = React.useState<AssetVersionContent[]>(
        assetVersion?.contents?.files.filter(file => isValidMeshFile(file.file_name)) || []
    );

    const handleParmChange = useCallback(
        (formData: dictionary) => {
        setParamValues({
            ...paramValues,
            ...formData
        });
        },
        [paramValues,setParamValues],
    );        

    const handleFileUpload = useCallback(
        (formData: Record<string, File>, callback:(file_id:string)=>void) => {
            // Get the first value from the formData
            const file = Object.values(formData)[0];
            
            setFileUpload(file,callback);
        },[setFileUpload]
    )
    const handleInputFileUpload = useCallback(
        (file: File) => {
            if (!file) return;
            if (isValidMeshFile(file.name)) {
                const uploadCb = (file_id: string) => {
                    const assetFile: AssetVersionContent = {
                        file_id: file_id,
                        file_name: file.name,
                        content_hash:  "",
                        size: file.size,
                    } 
                    setAvailableInputFiles((prevFiles) => [
                        ...prevFiles, 
                        assetFile
                    ]);
                        
                }
                setFileUpload(file,uploadCb);
            }
        },[setFileUpload]
    )

    if (!assetVersion )
        return <CircularProgress />;
    
    return (
        <Box
            sx={{
                ...style,
                padding: "15px",
                backgroundColor: "#1e1e1e",
                borderRight: "1px solid #333",
                overflowY: "auto",
                color: "#e0e0e0",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                sx={{
                    textAlign: "center",
                    marginBottom: "25px",
                    fontSize: "0.9em",
                    color: "#888",
                }}
            >
                {inputFileParms.length > 0 && (
                    <Box sx={{ marginTop:"0px", padding: "10px", border: "1px solid #333", borderRadius: "4px", marginBottom: "20px" }}>                    
                        { 
                            <>
                            <Typography
                                level="h4" 
                                fontSize="medium"
                                textAlign="left">
                                Add Files
                            </Typography>
                            <div 
                                className="field"
                                style={{ marginBottom: "10px"}}>
                            <input type="file" 
                                style={{width: "100%"}}
                                onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                
                                    if (file) {
                                        handleInputFileUpload(file)
                                    }
                                }}
                            />
                            </div>
                            </>
                        }

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
                )}
                <Box sx={{ padding: "10px", border: "1px solid #333", borderRadius: "4px", marginBottom: "20px" }}>

                    <Typography level="h4" fontSize="medium" mb="12px" textAlign="left">
                        Params
                    </Typography>
                    <ParmGroup
                        data={ paramValues }
                        group={parmTemplateGroup as hou.ParmTemplateGroup}
                        onChange={handleParmChange}
                        onFileUpload={handleFileUpload}
                    />
                </Box>
            </Box>
        </Box>

    )
}

export default SceneControls;