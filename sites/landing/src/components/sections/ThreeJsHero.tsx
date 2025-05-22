// src/components/sections/ThreeJsHero.tsx
import React, { useRef, useEffect, Suspense } from 'react';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Environment,
  useProgress,
  Html,
  Polyhedron
} from '@react-three/drei';
import * as THREE from 'three';
import { GLBModel } from '../../utils/modelUtils';

// Loading indicator component
const LoadingIndicator = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        color: 'white',
        fontSize: '16px',
        fontFamily: 'sans-serif',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        {progress.toFixed(0)}% loaded
      </div>
    </Html>
  );
};

// Polyhedron shape that serves as a loading placeholder
const LoadingPolyhedron = ({ scrollProgress }: { scrollProgress: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create a pulsing effect
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();

      // Rotate based on time and scroll progress
      meshRef.current.rotation.x = time * 0.3 + scrollProgress * Math.PI;
      meshRef.current.rotation.y = time * 0.2 + scrollProgress * Math.PI * 1.5;
      meshRef.current.rotation.z = time * 0.1;

      // Pulse scale based on time
      const pulse = 0.1 * Math.sin(time * 2);
      const baseScale = 1 + scrollProgress * 0.5;
      meshRef.current.scale.set(
        baseScale + pulse,
        baseScale + pulse,
        baseScale + pulse
      );

      // Shift position based on scroll
      meshRef.current.position.y = scrollProgress * -1;
      meshRef.current.position.z = -2 + scrollProgress * 3;

      // Change material properties based on time and scroll
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(time) + scrollProgress;
      }
    }
  });

  return (
    <Polyhedron
      ref={meshRef}
      position={[0, 0, 0]}
    >
      <meshStandardMaterial
        color="#3a86ff"
        roughness={0.3}
        metalness={0.7}
        emissive="#8338ec"
        emissiveIntensity={0.5}
        wireframe={false}
        flatShading={true}
      />
    </Polyhedron>
  );
};

// Interface for Particle props
interface ParticleProps {
  index: number;
  scrollProgress: number;
}

// Smaller particles that orbit around the main shape
const Particle: React.FC<ParticleProps> = ({ index, scrollProgress }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = 0.01 + (index % 5) * 0.002;
  const radius = 2 + (index % 3);
  const offset = index * (Math.PI * 2) / 20;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Orbital motion
      const t = clock.getElapsedTime() * speed + offset;
      meshRef.current.position.x = Math.sin(t) * radius;
      meshRef.current.position.z = Math.cos(t) * radius;
      meshRef.current.position.y = Math.sin(t * 0.5) * radius * 0.5;

      // Size pulsing based on scroll
      const pulseScale = 0.05 + Math.sin(t * 3) * 0.03;
      const scrollScale = 0.1 - scrollProgress * 0.05;
      meshRef.current.scale.set(scrollScale + pulseScale, scrollScale + pulseScale, scrollScale + pulseScale);

      // Color changes based on scroll
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        // Shift hue based on scroll progress
        const hue = (index * 0.1 + scrollProgress * 0.5) % 1;
        meshRef.current.material.color.setHSL(hue, 0.8, 0.5);
        meshRef.current.material.emissiveIntensity = 0.5 + scrollProgress;
      }
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        emissive="#ffffff"
        emissiveIntensity={0.5}
        toneMapped={false}
      />
    </mesh>
  );
};

// Camera controller that responds to scroll
interface CameraControllerProps {
  scrollProgress: number;
}

const CameraController: React.FC<CameraControllerProps> = ({ scrollProgress }) => {
  const { camera } = useThree();
  const cameraRef = useRef<THREE.Camera | null>(null);

  useEffect(() => {
    if (cameraRef.current) {
      camera.position.z = 5 - scrollProgress * 2;
      camera.position.y = 1 + scrollProgress * 0.5;
      camera.lookAt(0, 0, 0);
    }
  }, [scrollProgress, camera]);

  return null;
};

// Configurable scene options
interface SceneOptionsProps {
  showAbstractShape?: boolean;
  showModel?: boolean;
  modelPath?: string;
  environmentPreset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';
  fogColor?: string;
  fogDensity?: number;
  polyhedronColor?: string;
}

// Model loader component with loading state
const ModelWithLoading: React.FC<{
  path: string;
  scrollProgress: number;
}> = ({ path, scrollProgress }) => {
  const { active: loading } = useProgress();

  return (
    <>
      {/* Show polyhedron during loading if enabled */}
      {loading && (
        <LoadingPolyhedron scrollProgress={scrollProgress} />
      )}

      {/* The actual GLB model */}
      <GLBModel
        path={path}
        position={[0, -0.5, 0]}
        scale={1.5}
        enableScrollAnimation={true}
        scrollProgress={scrollProgress}
        scrollAnimations={{
          rotation: {
            y: [0, Math.PI * 2]
          },
          position: {
            y: [-0.5, 0.5],
            z: [0, -2]
          },
          scale: [1.5, 2]
        }}
      />
    </>
  );
};

// Main ThreeJS scene component
const ThreeScene: React.FC<SceneOptionsProps> = ({
  modelPath = null,
  environmentPreset = 'city',
  fogColor = '#14213d',
  fogDensity = 0.05
}) => {
  const { progress } = useScrollPosition();

  return (
    <Canvas shadows dpr={[1, 2]} style={{ width: '100%', height: '100%' }}>
      <fog attach="fog" args={[fogColor, 5 * fogDensity, 15]} />
      <ambientLight intensity={0.3} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.25}
        penumbra={1}
        intensity={1}
        castShadow={true}
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.5}
        color="#ff006e"
      />

      <CameraController scrollProgress={progress} />
      <PerspectiveCamera
        makeDefault
        position={[0, 1, 5]}
        fov={50}
      />

      <Suspense fallback={<LoadingIndicator />}>
        {/* GLB Model (optional) */}
        {modelPath && (
          <ModelWithLoading
            path={modelPath}
            scrollProgress={progress}
          />
        )}

        <Environment preset={environmentPreset} />
      </Suspense>
    </Canvas>
  );
};

// Interface for ThreeJsHero props
interface ThreeJsHeroProps extends SceneOptionsProps {
  className?: string;
  style?: React.CSSProperties;
}

// ThreeJS hero section with scroll-based animations
const ThreeJsHero: React.FC<ThreeJsHeroProps> = (props) => {
  return (
    <div
      className={`three-js-hero-container ${props.className || ''}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        ...props.style
      }}
    >
      <ThreeScene {...props} />
    </div>
  );
};

export default ThreeJsHero;