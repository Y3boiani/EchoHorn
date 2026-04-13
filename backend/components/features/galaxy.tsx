'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
// Note: Lazy loading these modules improves initial performance.
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Renders a 3D galaxy model using Three.js.
 *
 * Performance Optimizations for Next.js & Turbopack:
 * 1.  Dynamic Import: This entire component should be loaded dynamically in its parent
 * using `next/dynamic` with `ssr: false`. This prevents the heavy Three.js library
 * from being included in the initial server-side render and JavaScript bundle,
 * significantly improving page load times.
 *
 * Example in a parent component (e.g., page.tsx):
 * ```jsx
 * import dynamic from 'next/dynamic';
 * const Galaxy = dynamic(() => import('@/components/features/galaxy'), {
 * ssr: false,
 * loading: () => <div className="absolute inset-0 z-0 w-full h-full bg-black" />, // Optional loading placeholder
 * });
 * ```
 *
 * 2.  Resource Cleanup: The `useEffect` cleanup function properly disposes of the
 * Three.js renderer and removes the event listener to prevent memory leaks when
 * the component unmounts.
 * 3.  `useRef` for Stable Elements: Refs are used to hold the mount point and Three.js
 * essentials, preventing re-creations on component re-renders.
 */
const Galaxy = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  // Using a ref to hold the animation frame ID for cleanup.
  const animationFrameId = useRef<number>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined' || !mountRef.current) return;

    const currentMount = mountRef.current;

    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust for screen resolution
    currentMount.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);


    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minPolarAngle = Math.PI / 2.5;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Load Galaxy Model ---
    // Make sure 'galaxy.glb' is in your `/public` directory.
    const loader = new GLTFLoader();
    loader.load('/galaxy.glb', (gltf) => {
      gltf.scene.scale.set(3, 3, 3);
      scene.add(gltf.scene);
    }, undefined, (error) => {
        console.error('An error happened while loading the model:', error);
    });

    camera.position.z = 15;

    // --- Animation Loop ---
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle window resizing ---
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup Function ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // Dispose of renderer and remove its DOM element
      renderer.dispose();
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      // You can add more cleanup here for geometries, materials, etc. if needed
    };
  }, []); // Empty dependency array ensures this effect runs only once.

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 w-full h-full"
    />
  );
};

export default Galaxy;
