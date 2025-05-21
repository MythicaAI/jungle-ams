// src/components/sections/ThreeJsHero.tsx
import React, { useRef, useEffect } from 'react';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Abstract shape that will animate based on scroll
const AbstractShape = ({ scrollProgress }) => {
  const meshRef = useRef();
  
  // Use scrollProgress to animate the shape
  useFrame(() => {
    if (meshRef.current) {
      // Rotate based on scroll progress
      meshRef.current.rotation.x = scrollProgress * Math.PI;
      meshRef.current.rotation.y = scrollProgress * Math.PI * 2;
      
      // Scale based on scroll progress (creates a zoom effect)
      const scale = 1 + scrollProgress * 0.5;
      meshRef.current.scale.set(scale, scale, scale);
      
      // Shift position for perspective change based on scroll
      meshRef.current.position.z = -2 + scrollProgress * 4;
      meshRef.current.position.y = scrollProgress * -1;
    }
  });

  return (
    <group>
      {/* Base abstract shape */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial 
          color="#3a86ff" 
          roughness={0.3} 
          metalness={0.8} 
          emissive="#8338ec"
          emissiveIntensity={scrollProgress * 2}
        />
      </mesh>
      
      {/* Small orbiting particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Particle 
          key={i} 
          index={i} 
          scrollProgress={scrollProgress}
        />
      ))}
    </group>
  );
};

// Smaller particles that orbit around the main shape
const Particle = ({ index, scrollProgress }) => {
  const meshRef = useRef();
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
      if (meshRef.current.material) {
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
const CameraController = ({ scrollProgress }) => {
  const { camera } = useThree();
  const cameraRef = useRef();
  
  useEffect(() => {
    if (cameraRef.current) {
      camera.position.z = 5 - scrollProgress * 2;
      camera.position.y = 1 + scrollProgress * 0.5;
      camera.lookAt(0, 0, 0);
    }
  }, [scrollProgress, camera]);

  return null;
};

// Main ThreeJS scene component
const ThreeScene = () => {
  const { progress } = useScrollPosition();
  
  return (
    <Canvas shadows dpr={[1, 2]} style={{ width: '100%', height: '100%' }}>
      <fog attach="fog" args={['#14213d', 5, 15]} />
      <ambientLight intensity={0.3} />
      <spotLight 
        position={[5, 5, 5]} 
        angle={0.25} 
        penumbra={1} 
        intensity={1} 
        castShadow 
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
      
      <AbstractShape scrollProgress={progress} />
      
      <Environment preset="city" />
    </Canvas>
  );
};

// ThreeJS hero section with scroll-based animations
const ThreeJsHero = () => {
  return (
    <div className="three-js-hero-container" style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none' // Allow clicking through to content beneath
    }}>
      <ThreeScene />
    </div>
  );
};

export default ThreeJsHero;