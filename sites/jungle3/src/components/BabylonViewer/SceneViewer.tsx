import { useEffect, useRef } from 'react';
import { Box } from '@mui/joy';
import * as BABYLON from '@babylonjs/core'

interface SceneViewerProps {
  isWireframe: boolean;
  meshData?: {
    points: number[];
    indices: number[];
    normals?: number[];
    uvs?: number[];
  } | null;
}

const SceneViewer = ({ isWireframe, meshData }: SceneViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const customMeshRef = useRef<BABYLON.Mesh | null>(null);
  const planeRef = useRef<BABYLON.Mesh | null>(null);
  const objectMaterialRef = useRef<BABYLON.StandardMaterial | null>(null);
  const groundMaterialRef = useRef<BABYLON.StandardMaterial | null>(null);

  // Initialize Babylon scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine and scene
    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    // Create camera
    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 4,
      Math.PI / 4,
      10,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    // Create light
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light.intensity = 0.7;

    // Create ground plane
    const plane = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );
    planeRef.current = plane;
    plane.receiveShadows = true;

    // Create materials
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterialRef.current = groundMaterial;
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/painted_plaster_wall/painted_plaster_wall_diff_1k.png",
      scene
    );
    groundMaterial.bumpTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/painted_plaster_wall/painted_plaster_wall_nor_gl_1k.png",
      scene
    );
    groundMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    plane.material = groundMaterial;

    const objectMaterial = new BABYLON.StandardMaterial("objectMaterial", scene);
    objectMaterialRef.current = objectMaterial;
    objectMaterial.diffuseTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/rock_face_03/rock_face_03_diff_1k.png",
      scene
    );
    objectMaterial.bumpTexture = new BABYLON.Texture(
      "https://dl.polyhaven.org/file/ph-assets/Textures/png/1k/rock_face_03/rock_face_03_nor_gl_1k.png",
      scene
    );
    objectMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

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

  // Update wireframe mode when prop changes
  useEffect(() => {
    if (groundMaterialRef.current && planeRef.current) {
      groundMaterialRef.current.wireframe = isWireframe;
    }

    if (objectMaterialRef.current && customMeshRef.current) {
      objectMaterialRef.current.wireframe = isWireframe;
    }
  }, [isWireframe]);

  // Handle changes to mesh data
  useEffect(() => {
    if (meshData && meshData.points && meshData.indices) {
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

    if (customMeshRef.current) {
      customMeshRef.current.dispose();
    }

    const customMesh = new BABYLON.Mesh("customMesh", sceneRef.current);
    customMeshRef.current = customMesh;

    if (objectMaterialRef.current) {
      customMesh.material = objectMaterialRef.current;
    }

    const vertexData = new BABYLON.VertexData();
    vertexData.positions = vertices;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    vertexData.applyToMesh(customMesh);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
    </Box>
  );
};

export default SceneViewer;
