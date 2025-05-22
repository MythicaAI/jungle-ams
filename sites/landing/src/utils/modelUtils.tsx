// src/utils/modelUtils.ts
import { useEffect, useState, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { AnimationMixer, Group, Object3D, AnimationAction } from 'three';

/**
 * Options for loading and configuring a GLB model
 */
interface ModelOptions {
  path: string;              // Path to the GLB file
  scale?: number;            // Scale of the model
  position?: [number, number, number]; // Position [x, y, z]
  rotation?: [number, number, number]; // Rotation [x, y, z]
  animations?: {
    enabled?: boolean;       // Enable/disable animations
    clipIndex?: number;      // Index of the animation clip to play
    loop?: boolean;          // Loop the animation
    timeScale?: number;      // Speed of the animation (1 = normal)
  };
  onLoad?: (model: Group) => void; // Callback when model is loaded
  draco?: boolean;           // Use Draco compression
  dracoPath?: string;        // Path to Draco decoder
}

/**
 * Custom hook to load a GLB/GLTF model with options
 */
export const useGLBModel = (options: ModelOptions) => {
  const {
    path,
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    animations = { enabled: true, clipIndex: 0, loop: true, timeScale: 1 },
    onLoad,
    draco = false,
    dracoPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'
  } = options;

  const [model, setModel] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);

  // Configure loaders
  const gltfLoader = new GLTFLoader();

  if (draco) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(dracoPath);
    gltfLoader.setDRACOLoader(dracoLoader);
  }

  // Load the model
  useEffect(() => {
    setLoading(true);
    setError(null);

    gltfLoader.load(
      path,
      (gltf) => {
        try {
          const modelScene = gltf.scene;

          // Apply transformations
          modelScene.scale.setScalar(scale);
          modelScene.position.set(position[0], position[1], position[2]);
          modelScene.rotation.set(rotation[0], rotation[1], rotation[2]);

          // Setup animations if available
          if (animations.enabled && gltf.animations.length > 0) {
            const clipIndex = animations.clipIndex !== undefined ?
              animations.clipIndex : 0;

            if (clipIndex >= 0 && clipIndex < gltf.animations.length) {
              mixerRef.current = new AnimationMixer(modelScene);

              const clip = gltf.animations[clipIndex];
              actionRef.current = mixerRef.current.clipAction(clip);

              if (animations.loop) {
                actionRef.current.setLoop(animations.loop ? 2201 : 2200, Infinity);
              }

              if (animations.timeScale) {
                actionRef.current.timeScale = animations.timeScale;
              }

              actionRef.current.play();
            }
          }

          // Set model and trigger callback
          setModel(modelScene);
          setLoading(false);

          if (onLoad) {
            onLoad(modelScene);
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Unknown error loading model'));
          setLoading(false);
        }
      },
      // Progress callback
      (progress) => {
        // You can use progress.loaded and progress.total to show loading progress
      },
      // Error callback
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      if (actionRef.current) {
        actionRef.current.stop();
      }
    };
  }, [path]); // Only reload when path changes

  // Update animations
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return { model, loading, error };
};

/**
 * React component to render a GLB model with options
 */
interface GLBModelProps extends ModelOptions {
  scrollProgress?: number;            // Current scroll progress (0-1)
  enableScrollAnimation?: boolean;    // Enable scroll-based animations
  scrollAnimations?: {
    position?: {                     // Position animations
      x?: [number, number];           // [start, end] values for X
      y?: [number, number];           // [start, end] values for Y
      z?: [number, number];           // [start, end] values for Z
    };
    rotation?: {                     // Rotation animations
      x?: [number, number];           // [start, end] values for X
      y?: [number, number];           // [start, end] values for Y
      z?: [number, number];           // [start, end] values for Z
    };
    scale?: [number, number];         // [start, end] values for uniform scale
  };
  children?: React.ReactNode;         // Children to render inside the model group
}

export const GLBModel: React.FC<GLBModelProps> = ({
  scrollProgress = 0,
  enableScrollAnimation = false,
  scrollAnimations = {},
  children,
  ...options
}) => {
  const modelRef = useRef<Group>(null);
  const { model, loading, error } = useGLBModel(options);

  // Apply scroll-based animations
  useFrame(() => {
    if (modelRef.current && enableScrollAnimation) {
      // Position animations
      if (scrollAnimations.position) {
        const { x, y, z } = scrollAnimations.position;

        if (x) {
          modelRef.current.position.x = x[0] + (x[1] - x[0]) * scrollProgress;
        }

        if (y) {
          modelRef.current.position.y = y[0] + (y[1] - y[0]) * scrollProgress;
        }

        if (z) {
          modelRef.current.position.z = z[0] + (z[1] - z[0]) * scrollProgress;
        }
      }

      // Rotation animations
      if (scrollAnimations.rotation) {
        const { x, y, z } = scrollAnimations.rotation;

        if (x) {
          modelRef.current.rotation.x = x[0] + (x[1] - x[0]) * scrollProgress;
        }

        if (y) {
          modelRef.current.rotation.y = y[0] + (y[1] - y[0]) * scrollProgress;
        }

        if (z) {
          modelRef.current.rotation.z = z[0] + (z[1] - z[0]) * scrollProgress;
        }
      }

      // Scale animations
      if (scrollAnimations.scale) {
        const [startScale, endScale] = scrollAnimations.scale;
        const currentScale = startScale + (endScale - startScale) * scrollProgress;
        modelRef.current.scale.set(currentScale, currentScale, currentScale);
      }
    }
  });

  if (loading) {
    return null; // or a loading placeholder
  }

  if (error) {
    console.error('Error loading model:', error);
    return null; // or an error placeholder
  }

  return (
    <group ref={modelRef}>
      {model && <primitive object={model} />}
      {children}
    </group>
  );
};

/**
 * Usage examples:
 *
 * 1. Basic usage:
 * <GLBModel
 *   path="/models/robot.glb"
 *   scale={2}
 *   position={[0, -1, 0]}
 * />
 *
 * 2. With animations:
 * <GLBModel
 *   path="/models/character.glb"
 *   animations={{
 *     enabled: true,
 *     clipIndex: 0,
 *     loop: true,
 *     timeScale: 1.2
 *   }}
 * />
 *
 * 3. With scroll animations:
 * <GLBModel
 *   path="/models/spaceship.glb"
 *   scrollProgress={progress}
 *   enableScrollAnimation={true}
 *   scrollAnimations={{
 *     position: {
 *       y: [-2, 2],
 *       z: [5, -5]
 *     },
 *     rotation: {
 *       y: [0, Math.PI * 2]
 *     },
 *     scale: [1, 1.5]
 *   }}
 * />
 */