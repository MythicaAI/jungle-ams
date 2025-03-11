import { useEffect, useRef } from 'react';
import { Box } from '@mui/joy';
import * as BABYLON from '@babylonjs/core';
import { useSceneStore } from '@store/sceneStore';

const SceneViewer = () => {
  // Get state from the store
  const {
    selectedHdaIndex,
    hdaSchemas,
    isWireframe,
    meshData,
    showLogWindow,
    statusLog,
    setShowLogWindow
  } = useSceneStore();

  // Get the current HDA schema
  const currentSchema = hdaSchemas[selectedHdaIndex];

  // References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const customMeshRef = useRef<BABYLON.Mesh | null>(null);
  const materialsRef = useRef<{[key: string]: BABYLON.Material}>({});
  const shadowGeneratorRef = useRef<BABYLON.ShadowGenerator | null>(null);

  // Initialize Babylon scene with enhanced environment
  useEffect(() => {
    if (!canvasRef.current) return;

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
    sky.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
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
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/granite_tile/granite_tile_ao_1k.png",
      scene
    );
    groundMaterial.diffuseTexture.uScale = 2;
    groundMaterial.diffuseTexture.vScale = 2;
    groundMaterial.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);
    ground.material = groundMaterial;

    // Create materials for each HDA type
    // Crystal material
    const crystalMaterial = new BABYLON.PBRMaterial("crystal", scene);
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
    const rockMaterial = new BABYLON.PBRMaterial("rock", scene);
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
    const rockfaceMaterial = new BABYLON.PBRMaterial("rockface", scene);
    rockfaceMaterial.metallic = 0.0;
    rockfaceMaterial.roughness = 0.8;
    rockfaceMaterial.albedoTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/cliff_side/cliff_side_diff_1k.png",
      scene
    );
    rockfaceMaterial.bumpTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/cliff_side/cliff_side_disp_1k.png",
      scene
    );

    // Store materials for later use
    materialsRef.current = {
      crystal: crystalMaterial,
      rock: rockMaterial,
      rockface: rockfaceMaterial
    };

    // Begin rendering loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
    };
  }, []);

  // Update wireframe mode when state changes
  useEffect(() => {
    if (customMeshRef.current && customMeshRef.current.material) {
      customMeshRef.current.material.wireframe = isWireframe;
    }
  }, [isWireframe]);

  // Handle changes to mesh data
  useEffect(() => {
    if (meshData && meshData.points && meshData.indices && sceneRef.current) {
      createMeshFromData(
        meshData.points,
        meshData.indices,
        meshData.normals || [],
        meshData.uvs || []
      );
    }
  }, [meshData, currentSchema.material_name]);

  // Create mesh from data received via WebSocket
  const createMeshFromData = (vertices: number[], indices: number[], normals: number[], uvs: number[]) => {
    if (!sceneRef.current) return;

    const vertexData = new BABYLON.VertexData();
    vertexData.positions = vertices;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;

    // Fast path to update existing mesh if vertex count matches
    if (customMeshRef.current) {
      const currentVertexCount = customMeshRef.current.getTotalVertices();
      const newVertexCount = vertices.length / 3;

      if (currentVertexCount === newVertexCount) {
        vertexData.applyToMesh(customMeshRef.current);
        return;
      }
    }

    // Create a new mesh and swap to it once it's ready
    const newMesh = new BABYLON.Mesh("customMesh_new", sceneRef.current);

    // Get the appropriate material for this HDA
    const material = materialsRef.current[currentSchema.material_name];
    if (material) {
      newMesh.material = material;
      newMesh.material.wireframe = isWireframe;
    }

    vertexData.applyToMesh(newMesh, true);

    // Add to shadow generator
    if (shadowGeneratorRef.current) {
      shadowGeneratorRef.current.addShadowCaster(newMesh);
    }

    // Poll until the mesh is ready
    const pollMeshReady = (mesh: BABYLON.Mesh) => {
      if (mesh.isReady(true)) {
        // Dispose of the old mesh if it exists
        if (customMeshRef.current) {
          customMeshRef.current.dispose();
        }
        customMeshRef.current = mesh;
      } else {
        requestAnimationFrame(() => pollMeshReady(mesh));
      }
    };

    pollMeshReady(newMesh);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
