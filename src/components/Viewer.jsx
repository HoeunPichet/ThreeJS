"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Viewer = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        // Set renderer size and append to DOM
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional for better quality

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;

        // Optional: Adjust shadow map resolution for better quality
        directionalLight.shadow.mapSize.width = width;
        directionalLight.shadow.mapSize.height = height;

        // Optional: Define the area where shadows are calculated
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;

        scene.add(directionalLight);

        // Set a solid color background
        // scene.background = new THREE.Color(0x87ceeb);

        // Placeholder for the circle mesh
        let circle;

        // Load the GLB model
        const loader = new GLTFLoader();
        let model;

        loader.load(
            '/artifacts/soldier.glb', // Path to your GLB file
            (gltf) => {
                model = gltf.scene;
                scene.add(model);

                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Adjust the model's scale or position
                model.scale.set(0.5, 0.5, 0.5); // Adjust scale
                model.position.set(0, -1, 0);   // Adjust position

                // Center the camera on the model
                centerCameraOnModel(model, camera, renderer, scene);

                // Create a dynamic circle under the model
                const boundingBox = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                boundingBox.getSize(size);

                const maxDim = Math.max(size.x, size.y, size.z); // Get the largest dimension
                const radius = maxDim * 0.6; // Set the radius to 60% of the largest dimension

                const circleGeometry = new THREE.CircleGeometry(radius, 64); // Dynamic radius
                const circleMaterial = new THREE.MeshBasicMaterial({
                    color: 0xaaaaaa, // Light gray color
                    transparent: true,
                    opacity: 0.3, // Semi-transparent
                });
                circle = new THREE.Mesh(circleGeometry, circleMaterial);

                // Position the circle below the model
                circle.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
                circle.position.y = -8; // Adjust height to match the model's base

                scene.add(circle);
            },
            undefined,
            (error) => {
                console.error('An error occurred while loading the model:', error);
            }
        );

        // Add OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);

        // Enable damping for smoother interactions
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // LIMIT zoom distance
        controls.minDistance = 1;
        controls.maxDistance = 30;


        // Animation Loop
        const clock = new THREE.Clock(); // Use a clock for smooth time-based animations
        const animate = () => {
            requestAnimationFrame(animate);

            // Smoothly rotate the model using elapsed time
            if (model) {
                const elapsedTime = clock.getElapsedTime(); // Get elapsed time in seconds
                model.rotation.y = elapsedTime * 0.5; // Gradual rotation based on time
            }

            // Update controls (required for damping)
            controls.update();

            // Render the scene
            renderer.render(scene, camera);
        };

        animate();

        // Handle Window Resize
        const handleResize = () => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleDoubleClick = (event) => {
            const bounds = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(model, true);

            if (intersects.length > 0) {
                const target = intersects[0].point;

                // Desired position: pull back a bit from the intersection point
                const direction = new THREE.Vector3().subVectors(camera.position, target).normalize();
                const newCamPos = new THREE.Vector3().copy(target).add(direction.multiplyScalar(3)); // Distance from target

                // Animation variables
                const startPosition = camera.position.clone();
                const startLookAt = controls.target.clone();
                const endLookAt = target.clone();
                const duration = 1.2; // seconds

                const clock = new THREE.Clock();
                const animateZoom = () => {
                    const elapsed = clock.getElapsedTime();
                    const t = Math.min(elapsed / duration, 1); // clamp between 0 and 1

                    // Ease-in-out interpolation (optional)
                    const ease = t * (2 - t); // smoother easing

                    camera.position.lerpVectors(startPosition, newCamPos, ease);
                    controls.target.lerpVectors(startLookAt, endLookAt, ease);
                    controls.update();

                    renderer.render(scene, camera);

                    if (t < 1) {
                        requestAnimationFrame(animateZoom);
                    }
                };
                animateZoom();
            }
        };

        renderer.domElement.addEventListener('dblclick', handleDoubleClick);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className='w-full h-full cursor-grab' />;
};

// Function to center the camera on the model
function centerCameraOnModel(model, camera, renderer, scene) {
    // Create a bounding box for the model
    const boundingBox = new THREE.Box3().setFromObject(model);

    // Calculate the center of the bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Calculate the size of the bounding box
    const size = new THREE.Vector3();

    boundingBox.getSize(size);

    // Move the model so that its center aligns with the origin
    model.position.sub(center);

    // Update the camera position to frame the model
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180); // Convert fov to radians
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)); // Calculate camera distance

    camera.position.set(0, 0, cameraZ * 1.5); // Center the camera
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the origin

    // Optional: Debugging bounding box
    const helper = new THREE.Box3Helper(boundingBox, 0xff0000);
    // scene.add(helper); // Add bounding box helper to the scene

    // Update renderer
    renderer.render(scene, camera);
}

export default Viewer;
