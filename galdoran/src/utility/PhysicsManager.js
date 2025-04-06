import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';


export class PhysicsManager {
    constructor(){
        this.objects = {}
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
        groundColliderDesc.setTranslation(groundMesh.position.x, groundMesh.position.y, groundMesh.position.z, true);
        this.world.createCollider(groundColliderDesc);
    }

    createCube(scene) {
        // Add a falling cube
        const cubeSize = 1;
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.position.x = 0;
        cubeMesh.position.y = 25;
        cubeMesh.position.z = 0;
        scene.add(cubeMesh);

        // Rapier dynamic rigid body for the cube
        const cubeRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
        cubeRigidBodyDesc.setTranslation(cubeMesh.position.x, cubeMesh.position.y, cubeMesh.position.z, true);
        const cubeRigidBody = this.world.createRigidBody(cubeRigidBodyDesc);
        const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(cubeSize/2, cubeSize/2, cubeSize/2);
        this.world.createCollider(cubeColliderDesc, cubeRigidBody);
        this.objects[Object.entries(this.objects).length] = ["cube", cubeMesh, cubeRigidBody]
    }

    update(delta) {
        this.world.step();
        for (let i = 0; i < Object.entries(this.objects).length; i ++){
            if (this.objects[i][0] == "cube") {
                const mesh = this.objects[i][1];
                const body = this.objects[i][2];

                // update cubes position
                const position = body.translation();
                mesh.position.set(position.x, position.y, position.z);

                // update cubes rotation
                const rotation = body.rotation();
                mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

            }
        }
    }
}
