import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Box, Typography } from '@mui/joy';

// Animated model with smooth transitions
const Model = ({ geometry, position, color, rotation, isCenter = false }) => {
    const meshRef = useRef();
    
    // Smooth position animation
    const { animatedPosition, animatedScale } = useSpring({
        animatedPosition: position,
        animatedScale: isCenter ? [1.2, 1.2, 1.2] : [1, 1, 1],
        config: { tension: 120, friction: 20 }
    });
    
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += isCenter ? 0.015 : 0.008;
        }
    });
    
    return (
        <animated.mesh 
            ref={meshRef} 
            position={animatedPosition}
            scale={animatedScale}
            rotation={rotation}
        >
            {geometry}
            <meshStandardMaterial 
                color={color} 
                metalness={0.3}
                roughness={0.4}
            />
        </animated.mesh>
    );
};

// Simple backdrop/stage
const Backdrop = () => {
    return (
        <group>
            {/* Floor/stage */}
            <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[12, 12]} />
                <meshStandardMaterial 
                    color="#1a1a1a" 
                    metalness={0.1}
                    roughness={0.8}
                />
            </mesh>
            
            {/* Backdrop wall */}
            <mesh position={[0, 1, -4]}>
                <planeGeometry args={[12, 8]} />
                <meshStandardMaterial 
                    color="#2a2a2a" 
                    metalness={0.05}
                    roughness={0.9}
                />
            </mesh>
        </group>
    );
};

// 3D Space Overlay for the center model
const ModelOverlay = ({ item }) => {
    if (!item) return null;

    return (
        <Html
            position={[0, -3.5, 2]}
            transform={false}
            occlude={false}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl w-80 text-center">
                <h3 className="text-white font-semibold text-lg mb-1">
                    {item.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                    {item.description}
                </p>
            </div>
        </Html>
    );
};

// Mouse hover detection areas - moved inside Canvas
const HoverZones = ({ onHoverLeft, onHoverRight, onHoverExit }) => {
    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="fixed inset-0 pointer-events-none">
                {/* Left hover zone */}
                <div 
                    className="absolute left-0 top-0 w-32 h-full pointer-events-auto cursor-pointer opacity-0 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-transparent transition-all duration-300"
                    onMouseEnter={onHoverLeft}
                    onMouseLeave={onHoverExit}
                />
                
                {/* Right hover zone */}
                <div 
                    className="absolute right-0 top-0 w-32 h-full pointer-events-auto cursor-pointer opacity-0 hover:bg-gradient-to-l hover:from-blue-500/10 hover:to-transparent transition-all duration-300"
                    onMouseEnter={onHoverRight}
                    onMouseLeave={onHoverExit}
                />
            </div>
        </Html>
    );
};

// Visual indicators for hover direction - moved inside Canvas
const HoverIndicators = ({ hoverDirection }) => {
    if (!hoverDirection) return null;

    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="fixed inset-0 pointer-events-none">
                {hoverDirection === 'left' && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80">
                        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                )}
                {hoverDirection === 'right' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80">
                        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                )}
            </div>
        </Html>
    );
};

// Progress indicators - moved inside Canvas
const ProgressIndicators = ({ items, currentIndex, onIndexChange }) => {
    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => onIndexChange?.(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 pointer-events-auto ${
                            index === currentIndex 
                                ? 'bg-white shadow-lg scale-125' 
                                : 'bg-white/40 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>
        </Html>
    );
};

// Scene content component - contains all Canvas children
const SceneContent = ({ 
    items, 
    currentIndex, 
    onIndexChange, 
    hoverDirection, 
    onHoverLeft, 
    onHoverRight, 
    onHoverExit 
}) => {
    // Get models to display (current + adjacent)
    const getVisibleModels = () => {
        const models = [];
        
        // Left model
        if (currentIndex > 0) {
            models.push({
                ...items[currentIndex - 1],
                position: [-6, 0, -1],
                isCenter: false,
                key: 'left'
            });
        }
        
        // Center model (current)
        models.push({
            ...items[currentIndex],
            position: [0, 0, 0],
            isCenter: true,
            key: 'center'
        });
        
        // Right model
        if (currentIndex < items.length - 1) {
            models.push({
                ...items[currentIndex + 1],
                position: [6, 0, -1],
                isCenter: false,
                key: 'right'
            });
        }
        
        return models;
    };

    return (
        <>
            {/* Lighting setup */}
            <ambientLight intensity={0.2} />
            
            {/* Main spotlight from above */}
            <spotLight 
                position={[0, 8, 2]} 
                angle={0.4} 
                penumbra={0.5}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            
            {/* Fill light */}
            <pointLight position={[-5, 3, 5]} intensity={0.3} />
            <pointLight position={[5, 3, 5]} intensity={0.3} />
            
            {/* Backdrop */}
            <Backdrop />
            
            {/* Models */}
            {getVisibleModels().map((model) => (
                <Model
                    key={`${model.id}-${model.key}`}
                    geometry={model.geometry}
                    position={model.position}
                    color={model.color}
                    rotation={model.rotation || [0, 0, 0]}
                    isCenter={model.isCenter}
                />
            ))}
            
            <OrbitControls 
                enablePan={false} 
                enableZoom={true}
                minDistance={4}
                maxDistance={12}
                maxPolarAngle={Math.PI / 2.2}
            />
            
            {/* 3D Overlay for current model */}
            <ModelOverlay item={items[currentIndex]} />
            
            {/* Hover zones for navigation */}
            <HoverZones 
                onHoverLeft={onHoverLeft}
                onHoverRight={onHoverRight}
                onHoverExit={onHoverExit}
            />
            
            {/* Visual indicators for hover zones */}
            <HoverIndicators hoverDirection={hoverDirection} />
            
            {/* Progress indicators */}
            <ProgressIndicators 
                items={items}
                currentIndex={currentIndex}
                onIndexChange={onIndexChange}
            />
        </>
    );
};

// Main 3D Scene Component
const Scene3D = ({
    items,
    currentIndex = 0,
    onIndexChange,
    height = '600px',
    className = ''
}) => {
    const [hoverDirection, setHoverDirection] = useState(null);
    
    const handleHoverLeft = useCallback(() => {
        setHoverDirection('left');
    }, []);
    
    const handleHoverRight = useCallback(() => {
        setHoverDirection('right');
    }, []);
    
    const handleHoverExit = useCallback(() => {
        setHoverDirection(null);
    }, []);
    
    const handleTransition = useCallback((direction) => {
        if (direction === 'left' && currentIndex > 0) {
            onIndexChange?.(currentIndex - 1);
        } else if (direction === 'right' && currentIndex < items.length - 1) {
            onIndexChange?.(currentIndex + 1);
        }
        setHoverDirection(null);
    }, [currentIndex, items.length, onIndexChange]);

    // Auto-transition on hover
    React.useEffect(() => {
        let timeout;
        if (hoverDirection) {
            timeout = setTimeout(() => {
                handleTransition(hoverDirection);
            }, 800); // Delay before auto-transition
        }
        return () => clearTimeout(timeout);
    }, [hoverDirection, handleTransition]);

    return (
        <div 
            className={`relative w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 shadow-2xl ${className}`}
            style={{ height }}
        >
            <Canvas 
                camera={{ position: [0, 2, 8], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <SceneContent
                    items={items}
                    currentIndex={currentIndex}
                    onIndexChange={onIndexChange}
                    hoverDirection={hoverDirection}
                    onHoverLeft={handleHoverLeft}
                    onHoverRight={handleHoverRight}
                    onHoverExit={handleHoverExit}
                />
            </Canvas>
        </div>
    );
};

// Model selector cards
const ModelCards = ({ models, currentIndex, onIndexChange }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {models.map((model, index) => (
            <button
                key={model.id}
                onClick={() => onIndexChange(index)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    index === currentIndex
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
            >
                <h4 className="font-semibold text-gray-900 mb-2">{model.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{model.description}</p>
            </button>
        ))}
    </div>
);

// Main demo component
export default function DreiCarouselDemo() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const models = [
        {
            id: 1,
            title: "Geometric Box",
            description: "A simple cubic form with clean edges and minimal design",
            geometry: <boxGeometry args={[2, 2, 2]} />,
            color: "#ff46e5"
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
        <Box sx={{ width: '100%', maxWidth: '96ch', mx: 'auto', p: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    mb: 4,
                }}
            >
                <Typography level="h1" fontSize="2.25rem" fontWeight="lg" color="neutral.900">
                    3D Model Showcase
                </Typography>
                <Typography level="body-sm" color="neutral.600">
                    Hover on edges to navigate • {currentIndex + 1} of {models.length}
                </Typography>
            </Box>
                
            <Scene3D
                items={models}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
                height="600px"
            />
                
            <ModelCards
                models={models}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
            />
        </Box>);
}