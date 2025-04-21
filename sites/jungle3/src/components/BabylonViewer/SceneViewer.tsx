import { useEffect, useRef } from 'react';
import { Box } from '@mui/joy';
import * as BABYLON from '@babylonjs/core';
import "@babylonjs/inspector";
import "@babylonjs/node-geometry-editor";
import { useSceneStore } from '@store/sceneStore';

// Material names
const DEFAULT_MATERIAL = "default_mat";
const ROCK = "rock";
const ROCKFACE = "rockface";
const CRYSTAL = "crystal";
const PLANT = "plant";
const CACTUS = "cactus";

import {
  NodeGeometry,
  BoxBlock,
  SphereBlock,
  CylinderBlock,
} from "@babylonjs/core";

interface SceneViewerProps {
  packageName: string;
  onSceneCreated?: (scene: BABYLON.Scene) => void;
  onMeshSelected?: (mesh: BABYLON.Mesh) => void;
}
const SceneViewer: React.FC<SceneViewerProps> = ({
  packageName,
  onSceneCreated,
  onMeshSelected,
}) => {
  // Get state from the store
  const {
    packageMaterials,
    isWireframe,
    meshData,
    showLogWindow,
    statusLog,
    setShowLogWindow
  } = useSceneStore();

  // Get the current HDA schema
  const currentSchema = packageMaterials.find((pm) => pm.name === packageName);

  // References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const shadowGeneratorRef = useRef<BABYLON.ShadowGenerator | null>(null);
  const currentMeshRef = useRef<string | null>(null);
  const loadingMeshRef = useRef<string | null>(null);

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
    scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
      "https://assets.babylonjs.com/textures/country.env",
      scene
    );
    scene.clearColor = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);

    // Create a skydome
    const skydome = BABYLON.MeshBuilder.CreateBox(
      "sky",
      { size: 10000, sideOrientation: BABYLON.Mesh.BACKSIDE },
      scene
    );
    skydome.position.y = -500;
    skydome.isPickable = false;

    const sky = new BABYLON.BackgroundMaterial("skyMaterial", scene);
    sky.reflectionTexture = scene.environmentTexture.clone();
    if (sky.reflectionTexture) {
      sky.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    }
    sky.alpha = 0.5;
    skydome.material = sky;

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

    // Create a ground plane with better texture
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 15, height: 15 },
      scene
    );
    ground.receiveShadows = true;

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    const groundTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/granite_tile/granite_tile_ao_1k.png",
      scene
    );
    groundTexture.uScale = 2;
    groundTexture.vScale = 2;

    groundMaterial.diffuseTexture = groundTexture;
    groundMaterial.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);
    ground.material = groundMaterial;

    // Create materials for each HDA type
    // Crystal material
    const crystalMaterial = new BABYLON.PBRMaterial(CRYSTAL, scene);
    crystalMaterial.metallic = 1.0;
    crystalMaterial.roughness = 0.06;
    crystalMaterial.subSurface.isRefractionEnabled = true;
    crystalMaterial.subSurface.indexOfRefraction = 1.5;
    crystalMaterial.subSurface.tintColor = new BABYLON.Color3(1, 0.5, 1);
    crystalMaterial.emissiveColor = new BABYLON.Color3(0.0, 0.3, 1.0);
    crystalMaterial.emissiveIntensity = 0.75;
    crystalMaterial.albedoTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/slate_floor_02/slate_floor_02_ao_1k.png",
      scene
    );

    // Rock material
    const rockMaterial = new BABYLON.PBRMaterial(ROCK, scene);
    rockMaterial.metallic = 0.0;
    rockMaterial.roughness = 0.8;
    rockMaterial.albedoTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/rock_05/rock_05_diff_1k.png",
      scene
    );
    rockMaterial.bumpTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/rock_05/rock_05_bump_1k.png",
      scene
    );

    // Rockface material
    BABYLON.NodeMaterial.ParseFromFileAsync(ROCKFACE, "/demo_assets/rockifyMaterial.json", scene);

    // Plant material
    const plantMaterial = new BABYLON.PBRMaterial(PLANT, scene);
    plantMaterial.metallic = 0.0;
    plantMaterial.roughness = 0.8;
    plantMaterial.albedoTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/moss_wood/moss_wood_diff_1k.png",
      scene
    );
    plantMaterial.bumpTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/moss_wood/moss_wood_bump_1k.png",
      scene
    );

    // Cactus material
    const cactusMaterial = new BABYLON.StandardMaterial(CACTUS, scene);
    cactusMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.6, 0.4);
    cactusMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // Default material
    const defaultMaterial = new BABYLON.PBRMaterial(DEFAULT_MATERIAL, scene);
    defaultMaterial.albedoColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    defaultMaterial.metallic = 0.3;
    defaultMaterial.roughness = 0.4;

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
         console.log("enabling and swapping in loading mesh " + loadingMeshRef.current) ;
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
     console.log("mesh imported " + mesh.name) ;
    });
    scene.onReadyObservable.add(function() {
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
    if (onSceneCreated) {
      onSceneCreated(scene);
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
            onMeshSelected && onMeshSelected(pickResult.pickedMesh as BABYLON.Mesh);
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

  const updateWireframe = (_meshName: string, isWireframe: boolean) => {
      const mesh = sceneRef.current?.getMeshByName(_meshName);
      if (mesh?.material) {
        mesh.material.wireframe = isWireframe;
      }
  };

  // Update wireframe mode when state changes
  useEffect(() => {
    if (currentMeshRef.current) {
      updateWireframe(currentMeshRef.current, isWireframe);
    }
    if (loadingMeshRef.current) {
      updateWireframe(loadingMeshRef.current, isWireframe);
    }
  }, [isWireframe]);

  /**
   * Create or update custom mesh whenever the meshData changes
   */
  useEffect(() => {
    if (meshData && meshData.points && meshData.indices && sceneRef.current) {
      createMeshFromData(
        meshData.points,
        meshData.indices,
        meshData.normals || [],
        meshData.uvs || []
      );
    }
  }, [meshData]);

  // Create mesh from data received via WebSocket
  const createMeshFromData = (vertices: number[], indices: number[], normals: number[], uvs: number[]) => {
    if (!sceneRef.current) return;

    const vertexData = new BABYLON.VertexData();
    vertexData.positions = vertices;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;

    const newMeshName = `mesh_${Math.random().toString(36).substring(2, 10)}`;
    loadingMeshRef.current = newMeshName;

    // Create a new mesh and swap to it once it's ready
    const newMesh = new BABYLON.Mesh(newMeshName, sceneRef.current);
    vertexData.applyToMesh(newMesh);

    // Get the appropriate material for this HDA and set it on the mesh
    let material: BABYLON.Material | null = null;

    if (currentSchema) {
      material = sceneRef.current.getMaterialByName(currentSchema.material_name);
    }
    if (!material) {
      material = sceneRef.current.getMaterialByName(DEFAULT_MATERIAL);
    }
    if (material) {
      newMesh.material = material;
      newMesh.material.wireframe = isWireframe;
    }

    // Add to shadow generator
    if (shadowGeneratorRef.current) {
      shadowGeneratorRef.current.addShadowCaster(newMesh);
    }
  };

  /**
   * Handle dropping geometry from the sidebar
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!sceneRef.current || !canvasRef.current) return;

    const scene = sceneRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pickResult = scene.pick(x, y);
    if (pickResult && pickResult.hit && pickResult.pickedPoint) {
      const geometryType = e.dataTransfer.getData("geometryType");

      const nodeGeo = new NodeGeometry("myBoxGeometry");
      const output = new BABYLON.GeometryOutputBlock("geometryout");
      nodeGeo.outputBlock = output;
      switch (geometryType) {
        case "box": {
          const block: BoxBlock = new BoxBlock("boxBlock");
          block.geometry.connectTo(output.geometry);
          break;
        }

        case "sphere": {
          const block = new SphereBlock("sphereBlock");
          block.geometry.connectTo(output.geometry);
          break;
        }

        case "cylinder": {
          const block = new CylinderBlock("cylinderBlock");
          block.geometry.connectTo(output.geometry);
          break;
        }

      }

      nodeGeo.build();
      const mesh = nodeGeo.createMesh("nodegeomesh");
      if (mesh && pickResult.pickedPoint) {
        mesh.position.copyFrom(pickResult.pickedPoint);
      }
    }

  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Box
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>

      {/* Generation Log Overlay */}
      {showLogWindow && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: '40%',
            maxHeight: '40%',
            bgcolor: 'rgba(30, 30, 30, 0.85)',
            border: '1px solid #333',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            color: '#e0e0e0',
            overflow: 'hidden',
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
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              padding: '12px',
              maxHeight: 'calc(40vh - 40px)',
              overflowY: 'auto',
              fontSize: '0.85rem'
            }}
          >
            {statusLog.join('\n')}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SceneViewer;
