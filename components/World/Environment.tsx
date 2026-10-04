/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH } from '../../types';

// Static Shared Geometries & Materials to avoid instantiation during loop / render
const STAR_MATERIAL = new THREE.PointsMaterial({
  size: 0.5,
  color: "#ffffff",
  transparent: true,
  opacity: 0.8,
  sizeAttenuation: true,
});

const SEPARATOR_GEOMETRY = new THREE.PlaneGeometry(0.05, 200);
const SEPARATOR_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#00ffff",
  transparent: true,
  opacity: 0.4,
});

const FLOOR_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#1a0b2e",
  transparent: true,
  opacity: 0.9,
});

const GRID_GEOMETRY = new THREE.PlaneGeometry(300, 400, 30, 40);
const GRID_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#8800ff",
  wireframe: true,
  transparent: true,
  opacity: 0.15,
});

const SUN_GEOMETRY = new THREE.SphereGeometry(35, 32, 32);

const StarField: React.FC = () => {
  const speed = useStore(state => state.speed);
  const count = 800; // Optimized star count for extremely fast frame times
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 400;
      let y = (Math.random() - 0.5) * 200 + 50; // Keep mostly above horizon
      
      // Distribute Z randomly along the entire travel path plus buffer
      let z = -550 + Math.random() * 650;

      // Exclude stars from the central play area
      if (Math.abs(x) < 15 && y > -5 && y < 20) {
          if (x < 0) x -= 15;
          else x += 15;
      }

      pos[i * 3] = x;     
      pos[i * 3 + 1] = y; 
      pos[i * 3 + 2] = z; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positionsArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2; // Always move slightly even when stopped

    for (let i = 0; i < count; i++) {
        let z = positionsArray[i * 3 + 2];
        z += activeSpeed * delta * 2.0; // Parallax effect
        
        // Reset when it passes the camera (z > 100 gives plenty of buffer behind camera)
        if (z > 100) {
            z = -550 - Math.random() * 50; 
            
            // Re-randomize X/Y on respawn with exclusion logic
            let x = (Math.random() - 0.5) * 400;
            let y = (Math.random() - 0.5) * 200 + 50;
            
            if (Math.abs(x) < 15 && y > -5 && y < 20) {
                if (x < 0) x -= 15;
                else x += 15;
            }

            positionsArray[i * 3] = x;
            positionsArray[i * 3 + 1] = y;
        }
        positionsArray[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={STAR_MATERIAL} attach="material" />
    </points>
  );
};

const LaneGuides: React.FC = () => {
    const { laneCount } = useStore();
    
    const separators = useMemo(() => {
        const lines: number[] = [];
        const startX = -(laneCount * LANE_WIDTH) / 2;
        
        for (let i = 0; i <= laneCount; i++) {
            lines.push(startX + (i * LANE_WIDTH));
        }
        return lines;
    }, [laneCount]);

    const floorGeo = useMemo(() => new THREE.PlaneGeometry(laneCount * LANE_WIDTH, 200), [laneCount]);

    return (
        <group position={[0, 0.02, 0]}>
            {/* Lane Floor */}
            <mesh position={[0, -0.02, -20]} rotation={[-Math.PI / 2, 0, 0]} geometry={floorGeo} material={FLOOR_MATERIAL} />

            {/* Lane Separators - Glowing Lines */}
            {separators.map((x, i) => (
                <mesh key={`sep-${i}`} position={[x, 0, -20]} rotation={[-Math.PI / 2, 0, 0]} geometry={SEPARATOR_GEOMETRY} material={SEPARATOR_MATERIAL} />
            ))}
        </group>
    );
};

const RetroSun: React.FC = () => {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const sunGroupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
        // Gentle bobbing
        if (sunGroupRef.current) {
            sunGroupRef.current.position.y = 30 + Math.sin(state.clock.elapsedTime * 0.2) * 1.0;
            sunGroupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorTop: { value: new THREE.Color('#ffe600') }, // Bright Yellow
        uColorBottom: { value: new THREE.Color('#ff0077') } // Magenta/Pink
    }), []);

    return (
        <group ref={sunGroupRef} position={[0, 30, -180]}>
            <mesh geometry={SUN_GEOMETRY}>
                <shaderMaterial
                    ref={matRef}
                    uniforms={uniforms}
                    transparent
                    vertexShader={`
                        varying vec2 vUv;

                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        uniform float uTime;
                        uniform vec3 uColorTop;
                        uniform vec3 uColorBottom;

                        void main() {
                            // 1. Basic Vertical Gradient
                            vec3 color = mix(uColorBottom, uColorTop, vUv.y);
                            
                            // 2. Synthwave Scanlines
                            float stripeFreq = 40.0;
                            float stripeSpeed = 1.0;
                            float stripes = sin((vUv.y * stripeFreq) - (uTime * stripeSpeed));
                            
                            // Create sharp bands
                            float stripeMask = smoothstep(0.2, 0.3, stripes);
                            
                            // Fade scanlines out towards the top of the sun
                            float scanlineFade = smoothstep(0.7, 0.3, vUv.y); 
                            
                            // Apply dark bands (scanlines)
                            vec3 finalColor = mix(color, color * 0.1, (1.0 - stripeMask) * scanlineFade);

                            gl_FragColor = vec4(finalColor, 1.0);
                        }
                    `}
                />
            </mesh>
        </group>
    );
};

const MovingGrid: React.FC = () => {
    const speed = useStore(state => state.speed);
    const meshRef = useRef<THREE.Mesh>(null);
    const offsetRef = useRef(0);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
             const activeSpeed = speed > 0 ? speed : 5;
             offsetRef.current += activeSpeed * delta;
             
             // Grid cell size = 400 (length) / 40 (segments) = 10 units
             const cellSize = 10;
             
             // Move mesh forward (+Z) to simulate travel, then snap back
             const zPos = -100 + (offsetRef.current % cellSize);
             meshRef.current.position.z = zPos;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]} geometry={GRID_GEOMETRY} material={GRID_MATERIAL} />
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#050011']} />
      <fog attach="fog" args={['#050011', 40, 160]} />
      
      <ambientLight intensity={0.2} color="#400080" />
      <directionalLight position={[0, 20, -10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[0, 25, -150]} intensity={2} color="#ff00aa" distance={200} decay={2} />
      
      <StarField />
      <MovingGrid />
      <LaneGuides />
      
      <RetroSun />
    </>
  );
};
