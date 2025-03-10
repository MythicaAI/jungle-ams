import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

interface ModelLoaderOptions {
  autoCenter?: boolean;
  autoScale?: boolean;
  targetSize?: number;
  wireframe?: boolean;
  onProgress?: (event: BABYLON.ISceneLoaderProgressEvent) => void;
  rootUrl?: string;
}

/**
 * Load a 3D model into a Babylon.js scene
 *
 * @param scene The Babylon.js scene to load the model into
 * @param fileUrl The URL of the model file (GLB, GLTF, OBJ, etc.)
 * @param options Configuration options for loading the model
 * @returns A promise that resolves with the loaded meshes
 */
export const loadModelIntoScene = (
  scene: BABYLON.Scene,
  fileUrl: string,
  options: ModelLoaderOptions = {}
): Promise<BABYLON.AbstractMesh[]> => {
  const {
    autoCenter = true,
    autoScale = true,
    targetSize = 4,
    wireframe = false,
    onProgress,
    rootUrl = ''
  } = options;

  // Determine file extension to handle different formats
  const fileExtension = fileUrl.split('.').pop()?.toLowerCase() || '';

  return new Promise((resolve, reject) => {
    // When loading from a URL, we need to extract the file name
    const fileName = fileUrl.includes('/')
      ? fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
      : fileUrl;

    // Determine the root URL if not provided
    const effectiveRootUrl = rootUrl || (fileUrl.includes('/')
      ? fileUrl.substring(0, fileUrl.lastIndexOf('/') + 1)
      : '');

    // The ImportMeshAsync function from Babylon.js handles various file formats
    BABYLON.SceneLoader.ImportMeshAsync(
      '',                  // Names of meshes to load (empty means all)
      effectiveRootUrl,    // Root URL (path to the file's directory)
      fileName,            // Filename
      scene,               // Scene to load into
      onProgress           // Progress callback
    ).then(result => {
      const { meshes } = result;

      if (meshes.length === 0) {
        reject(new Error('No meshes were loaded'));
        return;
      }

      // Apply wireframe if requested
      if (wireframe) {
        applyWireframe(meshes);
      }

      // Auto-center and auto-scale if requested
      if (autoCenter || autoScale) {
        const rootMesh = meshes[0];
        const boundingInfo = calculateHierarchyBoundingInfo(rootMesh);

        if (boundingInfo) {
          if (autoCenter) {
            centerModel(rootMesh, boundingInfo);
          }

          if (autoScale) {
            scaleModelToFit(rootMesh, boundingInfo, targetSize);
          }
        }
      }

      resolve(meshes);
    }).catch(error => {
      reject(new Error(`Failed to load model: ${error.message}`));
    });
  });
};

/**
 * Apply wireframe material to all meshes
 */
export const applyWireframe = (meshes: BABYLON.AbstractMesh[]) => {
  meshes.forEach(mesh => {
    if (mesh.material) {
      mesh.material.wireframe = true;
    }
  });
};

/**
 * Calculate the bounding info for a hierarchy of meshes
 */
export const calculateHierarchyBoundingInfo = (rootMesh: BABYLON.AbstractMesh) => {
  return rootMesh.getHierarchyBoundingVectors();
};

/**
 * Center a model based on its bounding info
 */
export const centerModel = (
  rootMesh: BABYLON.AbstractMesh,
  boundingInfo: { min: BABYLON.Vector3; max: BABYLON.Vector3 }
) => {
  const modelSize = boundingInfo.max.subtract(boundingInfo.min);
  const boundingCenter = boundingInfo.min.add(modelSize.scale(0.5));

  // Position to center
  rootMesh.position = new BABYLON.Vector3(
    -boundingCenter.x * rootMesh.scaling.x,
    -boundingInfo.min.y * rootMesh.scaling.y, // Keep it on the ground
    -boundingCenter.z * rootMesh.scaling.z
  );
};

/**
 * Scale a model to fit within a specified target size
 */
export const scaleModelToFit = (
  rootMesh: BABYLON.AbstractMesh,
  boundingInfo: { min: BABYLON.Vector3; max: BABYLON.Vector3 },
  targetSize: number
) => {
  const modelSize = boundingInfo.max.subtract(boundingInfo.min);
  const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);

  if (maxDimension > 0) {
    const scaleFactor = targetSize / maxDimension;
    rootMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
  }
};

/**
 * Create a simple environment for the model
 */
export const createModelEnvironment = (
  scene: BABYLON.Scene,
  options: {
    groundSize?: number;
    groundColor?: string;
    skyboxEnabled?: boolean;
    environmentTexture?: string;
    shadowsEnabled?: boolean;
  } = {}
) => {
  const {
    groundSize = 10,
    groundColor = '#404040',
    skyboxEnabled = false,
    environmentTexture = '',
    shadowsEnabled = false
  } = options;

  // Create a ground
  const ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: groundSize, height: groundSize },
    scene
  );

  const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
  groundMaterial.diffuseColor = BABYLON.Color3.FromHexString(groundColor);
  groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  ground.material = groundMaterial;

  // Set up shadows if enabled
  if (shadowsEnabled) {
    const shadowGenerator = new BABYLON.ShadowGenerator(1024,
      scene.getLightByName('dirLight') as BABYLON.DirectionalLight
    );
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    ground.receiveShadows = true;
  }

  // Set up skybox if enabled
  if (skyboxEnabled) {
    const skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 1000 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      environmentTexture || 'https://assets.babylonjs.com/environments/environmentSpecular.env',
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
  }

  // Set up environment texture if provided
  if (environmentTexture) {
    scene.environmentTexture = new BABYLON.CubeTexture(environmentTexture, scene);
  }

  return { ground };
};

/**
 * Parse a file extension to determine the appropriate loader
 */
export const getModelFormatFromExtension = (fileUrl: string): string => {
  const extension = fileUrl.split('.').pop()?.toLowerCase() || '';

  switch (extension) {
    case 'glb':
    case 'gltf':
      return 'gltf';
    case 'obj':
      return 'obj';
    case 'stl':
      return 'stl';
    case 'babylon':
      return 'babylon';
    default:
      return 'unknown';
  }
};

/**
 * Check if a file format is supported
 */
export const isSupportedModelFormat = (fileUrl: string): boolean => {
  return getModelFormatFromExtension(fileUrl) !== 'unknown';
};
