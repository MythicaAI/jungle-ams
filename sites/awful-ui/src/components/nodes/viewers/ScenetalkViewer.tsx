/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/joy';
import * as BABYLON from '@babylonjs/core';
import { ConnectionStatus, MeshData, StatusLogEntry } from 'scenetalk';
import { SceneTalkConnection } from 'scenetalk';


interface ScenetalkViewerProps {
    onSceneCreated?: (scene: BABYLON.Scene) => void;
    onMeshSelected?: (mesh: BABYLON.Mesh) => void;
    paramValues?: { [key: string]: any } | null;
    fileUpload?: { file: File; callback: (file_id:string) => void } | null;
    hdaId?: string | null;
}

const ScenetalkViewer: React.FC<ScenetalkViewerProps> = (node) => {
    // Get state from the store

    const [meshData, setMeshData] = useState<MeshData | null>(null);
    //const [isWireframe, setIsWireframe] = useState(false);
    const [wsStatus, setWsStatus] = useState<ConnectionStatus>('disconnected');
    const [inputFiles, setInputFiles] = useState<{ [key: string]: any }>({});
    const [requestInFlight, setRequestInFlight] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(false);
    const [showLogWindow, setShowLogWindow] = useState(false);
    const [statusLog, setStatusLog] = useState<StatusLogEntry[]>([]);

    // References
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<BABYLON.Engine | null>(null);
    const sceneRef = useRef<BABYLON.Scene | null>(null);
    const shadowGeneratorRef = useRef<BABYLON.ShadowGenerator | null>(null);
    const currentMeshRef = useRef<string | null>(null);
    const loadingMeshRef = useRef<string | null>(null);
    const wsServiceRef = useRef<SceneTalkConnection | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize WebSocket service
    useEffect(() => {
        const sceneTalkUrl = import.meta.env.VITE_SCENE_TALK_URL;
        const wsService = new SceneTalkConnection(sceneTalkUrl);
        wsService.connect();
        wsServiceRef.current = wsService;

        return () => {
            wsService.disconnect();
        };
    }, []);

    // Initialize Babylon scene with enhanced environment
    useEffect(() => {
        if (!canvasRef.current) return;

        console.info("creating new Babylon scene")

        // Create engine and scene
        const engine = new BABYLON.Engine(canvasRef.current, true);
        engineRef.current = engine;

        const scene = new BABYLON.Scene(engine);
        sceneRef.current = scene;

        // Set environment

        const environment = scene.createDefaultEnvironment();
        environment?.setMainColor(BABYLON.Color3.White());


        // Create camera with better positioning
        const camera = new BABYLON.ArcRotateCamera(
            "Camera",
            0.1,
            1.0,
            8,
            BABYLON.Vector3.Zero(),
            scene
        );
        camera.setTarget(new BABYLON.Vector3(0, 0.2, 0));
        camera.attachControl(canvasRef.current, true);
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 20;
        camera.panningSensibility = 0;
        camera.wheelPrecision = 15;
        camera.lowerBetaLimit = 0.2;
        camera.upperBetaLimit = Math.PI / 2.2;
    
        // Create hemispheric light
        const hemiLight = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );
        hemiLight.intensity = 0.6;
        hemiLight.groundColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    
        // Create directional light for shadows
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            scene
        );
        dirLight.position = new BABYLON.Vector3(20, 40, 20);
        dirLight.intensity = 0.2;
        dirLight.shadowOrthoScale = 2;
    
        // Create shadow generator
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        shadowGenerator.useExponentialShadowMap = true;
        shadowGeneratorRef.current = shadowGenerator;

        
        // Handle scene ready events
        scene.onNewMeshAddedObservable.add(function (mesh) {
            console.log("on new mesh added observable " + mesh.name);
            if (!loadingMeshRef.current) {
                return;
            }

            // Do mesh swap
            if (mesh.name === loadingMeshRef.current) {
                console.log("starting mesh swap " + mesh.name);

                const loadingMesh = scene.getMeshByName(loadingMeshRef.current);
                if (loadingMesh) {
                    console.log("enabling and swapping in loading mesh " + loadingMeshRef.current);
                    loadingMesh.isVisible = true;
                } else {
                    console.log("loading mesh not found " + loadingMeshRef.current);
                }

                // Remove current mesh
                if (currentMeshRef.current && currentMeshRef.current !== loadingMeshRef.current) {
                    console.log("removing current mesh " + currentMeshRef.current);
                    const mesh = scene.getMeshByName(currentMeshRef.current);
                    if (mesh) {
                        scene.removeMesh(mesh, true);
                        mesh.isVisible = false;
                        mesh.dispose();
                    }
                    else {
                        console.log("mesh not found " + currentMeshRef.current);
                    }
                }

                // Update the refs
                currentMeshRef.current = loadingMeshRef.current;
                loadingMeshRef.current = null;
            }
        });
        scene.onMeshImportedObservable.add(function (mesh) {
            console.log("mesh imported " + mesh.name);
        });
        scene.onReadyObservable.add(function () {
            console.log("ready observable")
        });

        // Begin rendering loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Handle window resize
        const handleResize = () => {
            engine.resize();
        };

        window.addEventListener("resize", handleResize);

        // Notify parent that scene is ready
        if (node.onSceneCreated) {
            node.onSceneCreated(scene);
        }

        // Pointer observable for mesh selection
        scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                const event = pointerInfo.event;
                const canvasRect = canvasRef.current?.getBoundingClientRect();
                if (canvasRect) {
                    const x = event.clientX - canvasRect.left;
                    const y = event.clientY - canvasRect.top;
                    const pickResult = scene.pick(x, y);
                    if (pickResult && pickResult.hit && pickResult.pickedMesh) {
                        if (node.onMeshSelected) {
                            node.onMeshSelected(pickResult.pickedMesh as BABYLON.Mesh);
                        }
                    }
                }
            }
        });

        return () => {
            window.removeEventListener("resize", handleResize);
            scene.dispose();
            engine.dispose();
        };
        // Only run once (no dependencies)
    }, []);

    // Update handlers when hda changes
    useEffect(() => {
        const wsService = wsServiceRef.current;
        if (!wsService) return;

        setMeshData(null);
        setInputFiles({});

        wsService.setHandlers({
            onStatusChange: (status) => {
                setWsStatus(status);
                if (status === "connected") {
                    // Send initial cook request when connected
                    regenerateMesh();
                }
            },
            onStatusLog: (level, log) => {
                setStatusLog((oldlog) => [...oldlog, { level, log }]);
            },

            onGeometryData: (data) => {
                if (data.points && data.indices) {
                    setMeshData({
                        points: data.points,
                        indices: data.indices,
                        normals: data.normals,
                        uvs: data.uvs,
                        colors: data.colors,
                    });
                }
            },
            onFileDownload: (fileName, base64Content) => {
                SceneTalkConnection.downloadFileFromBase64(fileName, base64Content);
            },
            onRequestComplete: () => {
                setRequestInFlight(false);

                if (pendingRequest) {
                    setPendingRequest(false);
                    setTimeout(() => regenerateMesh(), 10);
                }

            },
        });
    }, [node.hdaId]);


    // Function to send a regenerate mesh request
    const regenerateMesh = (format = "raw") => {
        if (requestInFlight) {
            setPendingRequest(true);
            return;
        }
        // Set request in flight
        setRequestInFlight(true);

        try {
            if (!wsServiceRef.current) {
                console.error("WebSocket service not initialized");
                return;
            }

            if (!node.hdaId) {
                console.error("No HDA selected");
                return;
            }

            /*
            const jobDef = jobDefinitions?.find(
            (definition) => definition.source.file_id === selectedHdaId,
            );
            if (!jobDef) {
            console.error("Failed to find job definition");
            return;
            }
            */


            // Clear the status log
            setStatusLog([]);


            //const dependencyFileIds = jobDef.params_schema.params['dependencies']?.default || [];

            // Send the cook request with all parameters for the current HDA
            wsServiceRef.current.sendCookRequestById(
                node.hdaId as string,
                [],
                node.paramValues as { [key: string]: any },
                inputFiles,
                format,
            );
        } catch (error) {
            console.error("Error sending cook request:", error);
            setRequestInFlight(false);
        }
    };

    // Re-generate mesh when HDA or parameters change
    useEffect(() => {
        if (wsStatus === "connected" && !requestInFlight) {
            regenerateMesh();
        }
    }, [node.hdaId, node.paramValues, inputFiles]);

    useEffect(() => {
        if (node.fileUpload && wsStatus === "connected" && !requestInFlight) {
            wsServiceRef.current?.sendFileUploadMessage(node.fileUpload.file, node.fileUpload.callback);
        }
    }, [node.fileUpload]);


    /*
    // Update wireframe mode when state changes
    useEffect(() => {
        const updateWireframe = (_meshName: string, isWireframe: boolean) => {
            const mesh = sceneRef.current?.getMeshByName(_meshName);
            if (mesh?.material) {
                mesh.material.wireframe = isWireframe;
            }
        };

        if (currentMeshRef.current) {
            updateWireframe(currentMeshRef.current, isWireframe);
        }
        if (loadingMeshRef.current) {
            updateWireframe(loadingMeshRef.current, isWireframe);
        }
    }, [isWireframe]);
    */

    /**
     * Create or update custom mesh whenever the meshData changes
     */
    useEffect(() => {
        if (!meshData || !sceneRef.current) return;

        const vertexData = new BABYLON.VertexData();
        vertexData.positions = meshData.points
        vertexData.indices = meshData.indices;
        vertexData.normals = meshData.normals || [];
        vertexData.uvs = meshData.uvs || [];
        const colors = meshData.colors || [];

        // Convert RGB to RGBA
        vertexData.colors = [];
        for (let i = 0; i < colors.length; i++) {
            vertexData.colors.push(colors[i]);
            if (i % 3 === 2) {
                vertexData.colors.push(1.0);
            }
        }

        const newMeshName = `mesh_${Math.random().toString(36).substring(2, 10)}`;
        loadingMeshRef.current = newMeshName;

        // Create a new mesh and swap to it once it's ready
        const newMesh = new BABYLON.Mesh(newMeshName, sceneRef.current);
        vertexData.applyToMesh(newMesh);


        // Add to shadow generator
        if (shadowGeneratorRef.current) {
            shadowGeneratorRef.current.addShadowCaster(newMesh);
        }
    }, [meshData]);

    useEffect(() => {
        if (!containerRef.current || !engineRef.current) return;
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            engineRef.current!.setSize(width - 20, height - 20);
        });
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className={`mythica-node worker nodrag nowheel`}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', paddingBottom: '10px' }}></canvas>
            {/* Generation Log Overlay */}
            {showLogWindow && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        width: '40%',
                        maxHeight: '40vh',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'rgba(30, 30, 30, 0.85)',
                        border: '1px solid #333',
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                        color: '#e0e0e0',
                        zIndex: 1000,
                        borderRadius: '4px',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            bgcolor: 'rgba(45, 45, 45, 0.9)',
                            borderBottom: '1px solid #333'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setShowLogWindow(false)}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    background: '#333',
                                    border: '1px solid #555',
                                    color: '#e0e0e0',
                                    cursor: 'pointer',
                                    padding: '2px 8px',
                                    borderRadius: 3
                                }}
                            >
                                Close
                            </button>
                            <h3 style={{ margin: 0, width: '100%', textAlign: 'center', fontSize: '1rem' }}>Generation Log</h3>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            px: 2,
                            py: 1,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            whiteSpace: 'pre',
                            overflowY: 'auto',
                            overflowX: 'auto',
                            textAlign: 'left',
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                            letterSpacing: '0.015em'
                        }}
                    >
                        {statusLog.map((log, index) => (
                            <div key={index}>[{log.level}] {log.log}</div>
                        ))}
                    </Box>
                </Box>
            )}
        </div>
    );
};

export default ScenetalkViewer;
