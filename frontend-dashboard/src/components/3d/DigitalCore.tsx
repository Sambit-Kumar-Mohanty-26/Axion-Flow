import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

const GlowingEarth = () => {
  const groupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = elapsedTime * 0.12;
      groupRef.current.rotation.z = 0.15; 
    }

    if (atmosphereRef.current) {
        atmosphereRef.current.scale.setScalar(1.2 + Math.sin(elapsedTime * 1.5) * 0.02);
    }
  });

  return (
    <group ref={groupRef} scale={2.5}>
      <Sphere args={[1, 64, 64]}>
        <meshPhongMaterial
          color="#02040a" 
          emissive="#001533" 
          specular="#111111"
          shininess={10}
        />
      </Sphere>

      <Sphere args={[1.01, 40, 40]}>
        <meshBasicMaterial
          color="#0052cc" 
          wireframe
          transparent
          opacity={0.15}
        />
      </Sphere>

      <Sphere ref={atmosphereRef} args={[1, 64, 64]}>
         <meshBasicMaterial
            color="#00b8a9" 
            transparent
            opacity={0.05}
            side={THREE.BackSide} 
            blending={THREE.AdditiveBlending}
         />
      </Sphere>

      <OrbitingDot radius={1.3} speed={0.8} color="#00b8a9" offset={0} />
      <OrbitingDot radius={1.5} speed={0.6} color="#ffffff" offset={2} />
      <OrbitingDot radius={1.1} speed={1} color="#0052cc" offset={4} />
    </group>
  );
};

const OrbitingDot = ({ radius, speed, color, offset }: { radius: number, speed: number, color: string, offset: number }) => {
    const dotRef = useRef<THREE.Mesh>(null);
    
    useFrame(({ clock }) => {
        if(dotRef.current) {
            const t = clock.getElapsedTime() * speed + offset;
            dotRef.current.position.x = Math.cos(t) * radius;
            dotRef.current.position.z = Math.sin(t) * radius;
            dotRef.current.position.y = Math.sin(t * 0.5) * (radius * 0.5); 
        }
    });

    return (
        <mesh ref={dotRef}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color={color} />
        </mesh>
    )
}

export const DigitalCore = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#00b8a9" />
        <pointLight position={[-10, -5, -5]} intensity={1.5} color="#0052cc" />
        
        <GlowingEarth />
        
        <Stars 
          radius={100} 
          depth={50} 
          count={3000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={0.5} 
        />
      </Canvas>
    </div>
  );
};