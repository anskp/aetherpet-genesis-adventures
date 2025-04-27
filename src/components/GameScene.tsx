
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
  const petRef = useRef<THREE.Object3D | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  
  // Setup Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    
    // Add a platform/ground
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
    
    // Add ambient particles
    addAmbientParticles(scene);
    
    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (petRef.current) {
        // Make pet gently float
        petRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        
        // Rotate gently
        petRef.current.rotation.y += 0.01;
      }
      
      if (modelRef.current) {
        // Make model gently float
        modelRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        
        // Rotate gently
        modelRef.current.rotation.y += 0.01;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);
  
  // Load 3D model for electric type
  useEffect(() => {
    if (state.petType === 'electric' && state.petStage !== 'egg' && sceneRef.current) {
      try {
        // Remove existing model if any
        if (modelRef.current && sceneRef.current) {
          sceneRef.current.remove(modelRef.current);
          modelRef.current = null;
        }
        
        // Create a simple loader
        const loader = new GLTFLoader();
        
        // Load the model with proper error handling
        loader.load(
          '/models/pokemon/articuno.gltf',
          (gltf) => {
            if (!sceneRef.current) return;
            
            const model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);
            model.position.y = 0;
            
            // Add the model to the scene
            sceneRef.current.add(model);
            modelRef.current = model;
            
            console.log("GLTF model loaded successfully");
          },
          (progress) => {
            console.log('Loading model...', (progress.loaded / progress.total) * 100, '%');
          },
          (error) => {
            console.error('Error loading GLTF model:', error);
          }
        );
      } catch (error) {
        console.error('Failed to load 3D model:', error);
      }
    }
  }, [state.petType, state.petStage]);
  
  // Update pet when state changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Remove existing pet
    if (petRef.current) {
      sceneRef.current.remove(petRef.current);
    }
    
    // Create pet based on state
    if (state.petStage === 'egg') {
      createEgg(sceneRef.current);
    } else if (state.petType !== 'electric') {
      // Only create the geometric pet when not electric type
      // For electric type we use the 3D model
      createPet(sceneRef.current);
    }
    
  }, [state.petStage, state.petType, state.mood, state.isSleeping]);
  
  // Create egg
  const createEgg = (scene: THREE.Scene) => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x333333,
      roughness: 0.3,
    });
    
    const egg = new THREE.Mesh(geometry, material);
    egg.scale.y = 1.3; // Make it slightly egg-shaped
    scene.add(egg);
    petRef.current = egg;
    
    // Add glow effect to egg
    const glowGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    egg.add(glow);
  };
  
  // Create pet
  const createPet = (scene: THREE.Scene) => {
    // Basic pet shape - different for each type
    let bodyGeometry;
    let color;
    
    switch (state.petType) {
      case 'electric':
        // This is handled by the 3D model loading, so we just return
        return;
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
    
    // Apply mood changes
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
    
    // Apply sleeping state
    if (state.isSleeping) {
      emissive = 0x000022;
    }
    
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive,
      roughness: 0.6,
    });

    const pet = new THREE.Mesh(bodyGeometry, material);

    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.3, 0.8);
    pet.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.3, 0.8);
    pet.add(rightEye);

    // Add smile
    if (state.mood === 'happy') {
      const smileGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32, Math.PI);
      const smileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const smile = new THREE.Mesh(smileGeometry, smileMaterial);
      smile.position.set(0, 0, 0.8);
      smile.rotation.x = Math.PI / 2;
      pet.add(smile);
    } else {
      // Neutral mouth
      const mouthGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
      const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, -0.3, 0.6);
      pet.add(mouth);
    }

    scene.add(pet);
    petRef.current = pet;
  };
  
  // Add ambient particles
  const addAmbientParticles = (scene: THREE.Scene) => {
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 50;
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      // Color
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
    
    // Animate particles
    const animateParticles = () => {
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
      }
      
      particlesGeometry.attributes.position.needsUpdate = true;
      
      requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
  };
  
  // Helper functions
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
  
  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full canvas-container ${className || ''}`}
    />
  );
};

export default GameScene;
