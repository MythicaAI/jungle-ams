import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Torus, Text } from '@react-three/drei';

// Sample 3D models - replace with your actual models
const Model = ({ geometry, position, color, rotation }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Overlay component
const Overlay = ({ item, position = 'bottom-left', horizontal = false }) => {
  if (!item) return null;

  const baseClasses = "absolute bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm";
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  const widthClass = horizontal ? 'max-w-xs' : 'max-w-sm';

  return (
    <div className={`${baseClasses} ${positionClasses[position]} ${widthClass}`}>
      <h3 className="font-bold text-lg mb-2">{item.title}</h3>
      <p className="text-sm opacity-90">{item.description}</p>
    </div>
  );
};

// Navigation arrows for carousel
const NavArrows = ({ onPrev, onNext, canPrev, canNext }) => (
  <>
    <button
      onClick={onPrev}
      disabled={!canPrev}
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full backdrop-blur-sm transition-all"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      onClick={onNext}
      disabled={!canNext}
      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full backdrop-blur-sm transition-all"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </>
);

// Main 3D Scene Component
const Scene3D = ({ 
  items, 
  horizontal = false, 
  currentIndex = 0, 
  onIndexChange,
  overlayPosition = 'bottom-left',
  height = '500px'
}) => {
  const cameraPosition = horizontal ? [0, 2, 8] : [3, 3, 6];
  const modelsPerView = horizontal ? 3 : 1;
  
  const getVisibleModels = () => {
    if (!horizontal) return [items[currentIndex]].filter(Boolean);
    
    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(items.length, start + modelsPerView);
    return items.slice(start, end);
  };
  
  const getModelPositions = () => {
    if (!horizontal) return [[0, 0, 0]];
    
    const spacing = 4;
    const visibleCount = getVisibleModels().length;
    const startX = -(visibleCount - 1) * spacing / 2;
    
    return Array.from({ length: visibleCount }, (_, i) => [
      startX + i * spacing, 0, 0
    ]);
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <Canvas camera={{ position: cameraPosition, fov: 50 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        {getVisibleModels().map((item, index) => {
          const position = getModelPositions()[index];
          return (
            <Model
              key={`${item.id}-${index}`}
              geometry={item.geometry}
              position={position}
              color={item.color}
              rotation={item.rotation || [0, 0, 0]}
            />
          );
        })}
        
        <OrbitControls enablePan={false} enableZoom={!horizontal} />
      </Canvas>
      
      <Overlay 
        item={items[currentIndex]} 
        position={overlayPosition}
        horizontal={horizontal}
      />
      
      {horizontal && (
        <NavArrows
          onPrev={() => onIndexChange?.(Math.max(0, currentIndex - 1))}
          onNext={() => onIndexChange?.(Math.min(items.length - 1, currentIndex + 1))}
          canPrev={currentIndex > 0}
          canNext={currentIndex < items.length - 1}
        />
      )}
      
      {horizontal && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange?.(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Demo component
export default function DreiCarouselDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(false);

  // Sample data - replace with your actual models
  const models = [
    {
      id: 1,
      title: "Geometric Box",
      description: "A simple cubic form with clean edges and minimal design",
      geometry: <boxGeometry args={[2, 2, 2]} />,
      color: "#4f46e5"
    },
    {
      id: 2,
      title: "Sphere Model",
      description: "Smooth spherical geometry with organic appeal",
      geometry: <sphereGeometry args={[1.5, 32, 32]} />,
      color: "#06b6d4"
    },
    {
      id: 3,
      title: "Torus Ring",
      description: "Circular torus with balanced proportions",
      geometry: <torusGeometry args={[1.5, 0.5, 16, 100]} />,
      color: "#10b981"
    },
    {
      id: 4,
      title: "Cylinder Form",
      description: "Cylindrical structure with industrial aesthetics",
      geometry: <cylinderGeometry args={[1, 1, 3, 32]} />,
      color: "#f59e0b"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex gap-4 items-center">
        <h1 className="text-2xl font-bold">3D Model Viewer</h1>
        <button
          onClick={() => setIsHorizontal(!isHorizontal)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isHorizontal ? 'Single View' : 'Carousel View'}
        </button>
      </div>
      
      <Scene3D
        items={models}
        horizontal={isHorizontal}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        overlayPosition="bottom-left"
        height={isHorizontal ? "400px" : "600px"}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {models.map((model, index) => (
          <button
            key={model.id}
            onClick={() => setCurrentIndex(index)}
            className={`p-3 rounded-lg border-2 transition-all ${
              index === currentIndex 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-medium">{model.title}</div>
            <div className="text-xs text-gray-600 mt-1">{model.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}