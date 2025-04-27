
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import * as THREE from 'three';

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
    } else {
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
    let geometry;
    let color;
    
    switch (state.petType) {
      case 'fire':
        geometry = new THREE.TetrahedronGeometry(1, 1);
        color = 0xff5500;
        break;
      case 'water':
        geometry = new THREE.SphereGeometry(1, 32, 32);
        color = 0x0088ff;
        break;
      case 'forest':
        geometry = new THREE.OctahedronGeometry(1, 0);
        color = 0x00cc44;
        break;
      case 'electric':
        geometry = new THREE.DodecahedronGeometry(1, 0);
        color = 0xffcc00;
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
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
    
    const pet = new THREE.Mesh(geometry, material);
    
    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.3, 0.6);
    pet.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.3, 0.6);
    pet.add(rightEye);
    
    // Add pupils
    const pupilGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0, 0, 0.1);
    leftEye.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0, 0, 0.1);
    rightEye.add(rightPupil);
    
    // Close eyes if sleeping
    if (state.isSleeping) {
      leftEye.scale.y = 0.1;
      rightEye.scale.y = 0.1;
      leftPupil.visible = false;
      rightPupil.visible = false;
    }
    
    // Simple mouth
    let mouth;
    if (state.mood === 'happy') {
      // Happy mouth
      const curve = new THREE.EllipseCurve(0, -0.3, 0.3, 0.1, 0, Math.PI, false);
      const points = curve.getPoints(10);
      const mouthGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const mouthMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      mouth = new THREE.Line(mouthGeometry, mouthMaterial);
    } else if (state.mood === 'hungry' || state.mood === 'tired') {
      // Sad/hungry mouth
      const curve = new THREE.EllipseCurve(0, -0.4, 0.3, 0.1, Math.PI, 0, false);
      const points = curve.getPoints(10);
      const mouthGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const mouthMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      mouth = new THREE.Line(mouthGeometry, mouthMaterial);
    } else {
      // Neutral mouth
      const mouthGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
      const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.set(0, -0.3, 0.6);
    }
    
    pet.add(mouth);
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
