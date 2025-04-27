import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

const Model = ({ petType, petStage, mood, isSleeping }) => {
  const gltfRef = useRef();
  let modelPath = '';
  
  if (petType === 'electric' && petStage !== 'egg') {
    modelPath = '/models/pokemon/articuno.gltf';
  }
  
  if (modelPath) {
    const { scene } = useGLTF(modelPath);
    
    useFrame((state, delta) => {
      if (gltfRef.current) {
        gltfRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        gltfRef.current.rotation.y += delta * 0.2;
      }
    });
    
    return (
      <primitive 
        ref={gltfRef}
        object={scene.clone()} 
        scale={0.5} 
        position={[0, 0, 0]}
      />
    );
  }
  
  return null;
};

interface GameSceneProps {
  className?: string;
}

const GameScene: React.FC<GameSceneProps> = ({ className }) => {
  const { state } = useGame();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const petRef = useRef<THREE.Mesh | null>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    
    const groundGeometry = new THREE.CircleGeometry(3, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: getPetTypeColor(state.petType, 0.3),
      transparent: true,
      opacity: 0.5,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    scene.add(ground);
    
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (petRef.current) {
        petRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        petRef.current.rotation.y += 0.01;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    if (state.petType !== 'electric' || state.petStage === 'egg') {
      animate();
    }
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [state.petType]);
  
  useEffect(() => {
    if (!sceneRef.current) return;
    
    if (state.petType === 'electric' && state.petStage !== 'egg') {
      return;
    }
    
    if (petRef.current) {
      sceneRef.current.remove(petRef.current);
    }
    
    if (state.petStage === 'egg') {
      createEgg(sceneRef.current);
    } else {
      createPet(sceneRef.current);
    }
  }, [state.petStage, state.petType, state.mood, state.isSleeping]);
  
  const createEgg = (scene: THREE.Scene) => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x333333,
      roughness: 0.3,
    });
    
    const egg = new THREE.Mesh(geometry, material);
    egg.scale.y = 1.3;
    scene.add(egg);
    petRef.current = egg;
    
    const glowGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    egg.add(glow);
  };
  
  const createPet = (scene: THREE.Scene) => {
    let bodyGeometry;
    let color;
    
    switch (state.petType) {
      case 'electric':
        bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
        color = 0xffd700;
        break;
      case 'fire':
        bodyGeometry = new THREE.TetrahedronGeometry(1, 1);
        color = 0xff5500;
        break;
      case 'water':
        bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
        color = 0x0088ff;
        break;
      case 'forest':
        bodyGeometry = new THREE.OctahedronGeometry(1, 0);
        color = 0x00cc44;
        break;
      default:
        bodyGeometry = new THREE.BoxGeometry(1, 1, 1);
        color = 0xffffff;
    }
    
    let emissive = 0x000000;
    
    switch (state.mood) {
      case 'happy':
        emissive = 0x222200;
        break;
      case 'hungry':
        emissive = 0x332200;
        break;
      case 'tired':
        emissive = 0x000022;
        break;
      case 'dirty':
        color = blendColors(color, 0x665544, 0.3);
        break;
      case 'sick':
        color = blendColors(color, 0x66aaaa, 0.3);
        break;
      default:
        break;
    }
    
    if (state.isSleeping) {
      emissive = 0x000022;
    }
    
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive,
      roughness: 0.6,
    });

    const pet = new THREE.Mesh(bodyGeometry, material);

    if (state.petType === 'electric') {
      const earGeometry = new THREE.ConeGeometry(0.3, 0.8, 4);
      const earMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: emissive
      });

      const leftEar = new THREE.Mesh(earGeometry, earMaterial);
      leftEar.position.set(-0.5, 1, 0);
      leftEar.rotation.z = Math.PI / 6;
      pet.add(leftEar);

      const rightEar = new THREE.Mesh(earGeometry, earMaterial);
      rightEar.position.set(0.5, 1, 0);
      rightEar.rotation.z = -Math.PI / 6;
      pet.add(rightEar);

      const tipGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
      const tipMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      
      const leftTip = new THREE.Mesh(tipGeometry, tipMaterial);
      leftTip.position.set(0, 0.4, 0);
      leftEar.add(leftTip);
      
      const rightTip = new THREE.Mesh(tipGeometry, tipMaterial);
      rightTip.position.set(0, 0.4, 0);
      rightEar.add(rightTip);

      const cheekGeometry = new THREE.CircleGeometry(0.2, 32);
      const cheekMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        side: THREE.DoubleSide
      });

      const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
      leftCheek.position.set(-0.6, 0, 0.5);
      leftCheek.rotation.y = Math.PI / 2;
      pet.add(leftCheek);

      const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
      rightCheek.position.set(0.6, 0, 0.5);
      rightCheek.rotation.y = Math.PI / 2;
      pet.add(rightCheek);
    }

    const eyeGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.3, 0.8);
    pet.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.3, 0.8);
    pet.add(rightEye);

    if (state.mood === 'happy') {
      const smileGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32, Math.PI);
      const smileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const smile = new THREE.Mesh(smileGeometry, smileMaterial);
      smile.position.set(0, 0, 0.8);
      smile.rotation.x = Math.PI / 2;
      pet.add(smile);
    } else {
      const mouthGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
      const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, -0.3, 0.6);
      pet.add(mouth);
    }

    scene.add(pet);
    petRef.current = pet;
  };
  
  const addAmbientParticles = (scene: THREE.Scene) => {
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 50;
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    const animateParticles = () => {
      const positions = particlesGeometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
      }
      
      particlesGeometry.attributes.position.needsUpdate = true;
      
      requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
  };
  
  const getPetTypeColor = (type: string, opacity = 1): number => {
    switch (type) {
      case 'fire': return new THREE.Color(0xff5500).getHex();
      case 'water': return new THREE.Color(0x0088ff).getHex();
      case 'forest': return new THREE.Color(0x00cc44).getHex();
      case 'electric': return new THREE.Color(0xffcc00).getHex();
      default: return new THREE.Color(0x8855aa).getHex();
    }
  };
  
  const blendColors = (color1: number, color2: number, ratio: number): number => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    
    c1.lerp(c2, ratio);
    
    return c1.getHex();
  };
  
  const ThreeCanvas = () => (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <Model 
        petType={state.petType} 
        petStage={state.petStage} 
        mood={state.mood}
        isSleeping={state.isSleeping}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial 
          color={getPetTypeColor(state.petType, 0.3)} 
          transparent 
          opacity={0.5}
        />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
  
  return (
    <div ref={mountRef} className={`w-full h-full canvas-container ${className || ''}`}>
      {state.petType === 'electric' && state.petStage !== 'egg' ? (
        <ThreeCanvas />
      ) : null}
    </div>
  );
};

export default GameScene;
