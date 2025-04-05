import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';


export class PhysicsManager {
    constructor(){
        this.gravity = { x: 0.0, y: -9.81, z: 0.0 };
        this.world = new RAPIER.World(this.gravity);
    }

    createPlane(scene) {
        // Add a ground plane
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            side: THREE.DoubleSide
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = 15;
        scene.add(groundMesh);

        // Rapier ground collider
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(5, 0.1, 5);
        this.world.createCollider(groundColliderDesc);
    }

    createCube(scene) {
        // Add a falling cube
        const cubeSize = 1;
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.position.y = 25;
        scene.add(cubeMesh);

        // Rapier dynamic rigid body for the cube
        const cubeRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
        const cubeRigidBody = this.world.createRigidBody(cubeRigidBodyDesc);
        const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(cubeSize/2, cubeSize/2, cubeSize/2);
        this.world.createCollider(cubeColliderDesc, cubeRigidBody);
    }

    update(delta) {
        this.world.step();
    }
}
