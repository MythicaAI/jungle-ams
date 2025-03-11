import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/joy';
import * as BABYLON from '@babylonjs/core';
import 'babylonjs-loaders';

interface SceneViewFileProps {
  src: string;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  rotationSpeed?: number;
  showWireframe?: boolean;
  autoRotate?: boolean;
}

const SceneViewerFile = ({
                         src,
                         width = '100vh',
                         height = '100vh',
                         backgroundColor = '#303030',
                         rotationSpeed = 0.005,
                         showWireframe = false,
                         autoRotate = true
                       }: SceneViewFileProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const sceneRef = useRef<BABYLON.Scene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine and scene
    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    // Set background color
    scene.clearColor = BABYLON.Color4.FromHexString(backgroundColor + 'FF');

    // Create camera
    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2.5,
      5,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.wheelPrecision = 50;
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 20;

    // Create lights
    const hemiLight = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemiLight.intensity = 0.5;

    const dirLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(0, -0.5, -1),
      scene
    );
    dirLight.intensity = 0.7;

    // Create a simple ground
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );

    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = BABYLON.Color3.FromHexString("#404040");
    groundMaterial.specularColor = BABYLON.Color3.FromHexString("#202020");
    groundMaterial.wireframe = showWireframe;
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    // Load the 3D model
    setIsLoading(true);

    BABYLON.SceneLoader.ImportMesh("", "", src, scene,
      (meshes) => {
        // Success callback
        setIsLoading(false);

        // Position the model
        const rootMesh = meshes[0];

        // Apply wireframe if needed
        if (showWireframe) {
          meshes.forEach(mesh => {
            if (mesh.material) {
              mesh.material.wireframe = true;
            }
          });
        }

        // Center and scale the model to fit
        const boundingInfo = rootMesh.getHierarchyBoundingVectors();
        const modelSize = boundingInfo.max.subtract(boundingInfo.min);
        const scaleFactor = 4 / Math.max(modelSize.x, modelSize.y, modelSize.z);

        rootMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

        // Position to center
        const boundingCenter = boundingInfo.min.add(modelSize.scale(0.5));
        rootMesh.position = new BABYLON.Vector3(
          -boundingCenter.x * scaleFactor,
          -boundingInfo.min.y * scaleFactor,
          -boundingCenter.z * scaleFactor
        );

        // Reset camera position to look at the model
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.radius = 5;

        if (autoRotate) {
          // Add autorotation animation
          scene.registerBeforeRender(() => {
            rootMesh.rotate(
              BABYLON.Vector3.Up(),
              rotationSpeed,
              BABYLON.Space.WORLD
            );
          });
        }
      },
      null,
      (_, message, exception) => {
        // Error callback
        console.error("Error loading model:", message, exception);
        setIsLoading(false);
        setLoadingError(`Failed to load 3D model: ${message}`);
      }
    );

    // Start the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    // Clean up resources on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [src, backgroundColor, rotationSpeed, showWireframe, autoRotate]);

  // When the src changes, we need to reload the model
  useEffect(() => {
    if (sceneRef.current && src) {
      setIsLoading(true);
      setLoadingError(null);

      // Clear existing meshes except ground
      sceneRef.current.meshes.forEach(mesh => {
        if (mesh.name !== "ground") {
          mesh.dispose();
        }
      });

      // Reload model with new src
      BABYLON.SceneLoader.ImportMesh("", "", src, sceneRef.current,
        (meshes) => {
          setIsLoading(false);
          // Apply the same positioning as in the initial load
          // This code would be similar to the success callback above
          const rootMesh = meshes[0];

          if (showWireframe) {
            meshes.forEach(mesh => {
              if (mesh.material) {
                mesh.material.wireframe = true;
              }
            });
          }

          const boundingInfo = rootMesh.getHierarchyBoundingVectors();
          const modelSize = boundingInfo.max.subtract(boundingInfo.min);
          const scaleFactor = 4 / Math.max(modelSize.x, modelSize.y, modelSize.z);

          rootMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

          const boundingCenter = boundingInfo.min.add(modelSize.scale(0.5));
          rootMesh.position = new BABYLON.Vector3(
            -boundingCenter.x * scaleFactor,
            -boundingInfo.min.y * scaleFactor,
            -boundingCenter.z * scaleFactor
          );

          if (autoRotate) {
            sceneRef.current?.registerBeforeRender(() => {
              rootMesh.rotate(
                BABYLON.Vector3.Up(),
                rotationSpeed,
                BABYLON.Space.WORLD
              );
            });
          }
        },
        null,
        (_, message) => {
          setIsLoading(false);
          setLoadingError(`Failed to load 3D model: ${message}`);
        }
      );
    }
  }, [src]);

  return (
    <Box sx={{ position: 'relative', minHeight: '480x', minWidth: '640px', width, height }}>
  <canvas
    ref={canvasRef}
  style={{
    width: '100%',
      height: '100%',
      outline: 'none',
      touchAction: 'none'
  }}
  />

  {isLoading && (
    <Box
      sx={{
    position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 10
  }}
  >
    <CircularProgress />
    </Box>
  )}

  {loadingError && (
    <Box
      sx={{
    position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: 2,
      zIndex: 10
  }}
  >
    {loadingError}
    </Box>
  )}
  </Box>
);
};

export default SceneViewerFile;
