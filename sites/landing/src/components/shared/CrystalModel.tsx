import React, { useRef, useEffect } from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function CrystalModel() {
  const crystalRef = useRef(null);
  const glowRef = useRef(null);
  const lightRef = useRef(null);
  const modelRef = useRef(null);
  const crystalModel = useGLTF("/models/crystal.glb");
  const render = useThree();
  // render.scene.castShadow = true;
  // render.scene.receiveShadow = true;
  //
  // const params = {
	// 			color: 0xffffff,
	// 			transmission: 1,
	// 			opacity: 1,
	// 			metalness: 0,
	// 			roughness: 0,
	// 			ior: 1.5,
	// 			thickness: 0.01,
	// 			attenuationColor: 0xffffff,
	// 			attenuationDistance: 1,
	// 			specularIntensity: 1,
	// 			specularColor: 0xffffff,
	// 			envMapIntensity: 1,
	// 			lightIntensity: 1,
	// 			exposure: 1
	// 		};

  // Apply crystal material to the loaded model
  useEffect(() => {
    if (crystalModel.scene) {
      crystalModel.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0.4, 0.8, 1.0),
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.0,
            transmission: 0.8,
            thickness: 0.5,
            ior: 1.4,
            emissive: new THREE.Color(0.2, 0.5, 0.9),
            emissiveIntensity: 0.3
          });
          crystalRef.current = child;
        }
      });
    }
  }, [crystalModel]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5;
    }

    if (glowRef.current) {
      glowRef.current.rotation.x = time * 0.3;
      glowRef.current.rotation.y = time * 0.2;
    }

    // Pulse effect
    const pulse = Math.sin(time * 2) * 0.2 + 0.4;

    if (crystalRef.current && crystalRef.current.material) {
      crystalRef.current.material.emissiveIntensity = pulse;
    }

    if (lightRef.current) {
      lightRef.current.intensity = pulse * 3;
    }
  });

  return (
    <>
      {/* Crystal model */}
      <primitive ref={modelRef} object={crystalModel.scene} />

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <octahedronGeometry args={[2.3, 1]} />
        <meshBasicMaterial
          color={new THREE.Color(0.3, 0.6, 1.0)}
          transparent={true}
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner light */}
      <pointLight
        ref={lightRef}
        color={0x4080ff}
        intensity={2}
        distance={10}
        position={[0, 0, 0]}
      />
    </>
  );
}

export default CrystalModel;
