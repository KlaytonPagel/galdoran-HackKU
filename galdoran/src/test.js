import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Icosahedron } from './objects/Icosahedron';
import { Plane } from './objects/Plane';
import { PlayerCharacter } from './characters/player';
import { Tree01 } from './objects/Tree01';
import { PhysicsManager } from'./utility/PhysicsManager'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

// Main variables
let scene, camera, renderer, controls, physicsWorld;
let playerBody, playerMesh;
const keys = {};
const movementSpeed = 5;
const jumpForce = 5;

// Initialize the application
async function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x88ccff);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Pointer lock controls
    controls = new PointerLockControls(camera, document.body);
    
    // Add event listener for pointer lock
    document.addEventListener('click', () => {
        document.body.requestPointerLock = document.body.requestPointerLock || 
                                          document.body.mozRequestPointerLock || 
                                          document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();
    });

    // Pointer lock change event
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', onPointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', onPointerLockChange, false);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Initialize physics
    await initPhysics();

    // Create player
    createPlayer();

    // Create ground
    createGround();

    // Add some obstacles
    createObstacles();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Start animation loop
    animate();
}

// Pointer lock change handler
function onPointerLockChange() {
    if (document.pointerLockElement === document.body || 
        document.mozPointerLockElement === document.body || 
        document.webkitPointerLockElement === document.body) {
        controls.enabled = true;
        document.getElementById('instructions').style.display = 'none';
    } else {
        controls.enabled = false;
        document.getElementById('instructions').style.display = 'block';
    }
}

// Initialize Rapier physics
async function initPhysics() {
    // Load the Rapier wasm module
    await RAPIER.init();

    // Create physics world
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    physicsWorld = new RAPIER.World(gravity);
}

// Create player character
function createPlayer() {
    // Create player rigid body
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(0, 2, 0)
        .lockRotations(); // Prevent player from tipping over

    playerBody = physicsWorld.createRigidBody(rigidBodyDesc);

    // Create player collider (capsule shape)
    let colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5);
    physicsWorld.createCollider(colliderDesc, playerBody);

    // Create player mesh (not visible in first-person, but needed for physics)
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xff69b4,
        visible: false // Hide the mesh in first-person view
    });
    playerMesh = new THREE.Mesh(geometry, material);
    playerMesh.castShadow = true;
    scene.add(playerMesh);
}

// Create ground
function createGround() {
    // Physics ground
    let groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    let groundBody = physicsWorld.createRigidBody(groundBodyDesc);
    
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(50, 0.5, 50);
    physicsWorld.createCollider(groundColliderDesc, groundBody);

    // Visual ground
    const groundGeometry = new THREE.BoxGeometry(100, 1, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3a5f0b });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.y = -0.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
}

// Create some obstacles
function createObstacles() {
    // Box obstacle
    let boxBodyDesc = RAPIER.RigidBodyDesc.fixed();
    let boxBody = physicsWorld.createRigidBody(boxBodyDesc);
    
    let boxColliderDesc = RAPIER.ColliderDesc.cuboid(1, 1, 1);
    physicsWorld.createCollider(boxColliderDesc, boxBody);
    boxBody.setTranslation({x: 5, y: 1, z: 0});

    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x4682b4 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(5, 1, 0);
    boxMesh.castShadow = true;
    scene.add(boxMesh);
}

// Handle keyboard input
function onKeyDown(event) {
    keys[event.key.toLowerCase()] = true;
}

function onKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
}

// Update player movement based on camera direction
function updatePlayer(deltaTime) {
    if (!playerBody || !controls.enabled) return;

    const linvel = playerBody.linvel();
    const impulse = {x: 0, y: 0, z: 0};

    // Get camera forward and right vectors
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Keep movement horizontal
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection);
    cameraRight.normalize();

    // Movement relative to camera direction
    if (keys['w'] || keys['arrowup']) {
        impulse.x += cameraDirection.x * movementSpeed;
        impulse.z += cameraDirection.z * movementSpeed;
    }
    if (keys['s'] || keys['arrowdown']) {
        impulse.x -= cameraDirection.x * movementSpeed;
        impulse.z -= cameraDirection.z * movementSpeed;
    }
    if (keys['a'] || keys['arrowleft']) {
        impulse.x += cameraRight.x * movementSpeed;
        impulse.z += cameraRight.z * movementSpeed;
    }
    if (keys['d'] || keys['arrowright']) {
        impulse.x -= cameraRight.x * movementSpeed;
        impulse.z -= cameraRight.z * movementSpeed;
    }

    // Apply damping to existing velocity
    impulse.x -= linvel.x * 0.5;
    impulse.z -= linvel.z * 0.5;

    // Jump
    if ((keys[' '] || keys['space']) && isPlayerOnGround()) {
        impulse.y = jumpForce;
    }

    playerBody.applyImpulse(impulse, true);
}

// Check if player is on ground
function isPlayerOnGround() {
    const rayOrigin = playerBody.translation();
    rayOrigin.y -= 0.6; // Adjust based on player height
    const rayDir = {x: 0, y: -1, z: 0};
    const ray = new RAPIER.Ray(rayOrigin, rayDir);
    const hit = physicsWorld.castRay(ray, 0.2, true);
    
    return hit && hit.toi < 0.15;
}

// Update physics and sync with Three.js objects
function updatePhysics(deltaTime) {
    physicsWorld.step();
    
    // Update player mesh to match physics body
    if (playerBody && playerMesh) {
        const playerPos = playerBody.translation();
        const playerRot = playerBody.rotation();
        
        playerMesh.position.set(playerPos.x, playerPos.y, playerPos.z);
        playerMesh.quaternion.set(playerRot.x, playerRot.y, playerRot.z, playerRot.w);
        
        // Sync camera position with player (but keep rotation independent)
        controls.object.position.set(playerPos.x, playerPos.y + 0.5, playerPos.z);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const deltaTime = 1 / 60; // Fixed time step for physics
    
    // Update game state
    updatePlayer(deltaTime);
    updatePhysics(deltaTime);

    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the application
init();
