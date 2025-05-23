import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import CrystalModel from "./CrystalModel.tsx";


export default function CrystalHeroScene() {
  return (
    <Canvas>
      <CrystalModel />
      <OrbitControls />
      <Environment preset="dawn" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </Canvas>
  )
}
