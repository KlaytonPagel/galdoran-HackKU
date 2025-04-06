import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { KinematicCharacterController } from '@dimforge/rapier3d';
import * as RAPIER from '@dimforge/rapier3d';


export class PhysicsCharacter{
    constructor(posx, posy, posz, rotx, roty, rotz, modelLocation, scene, physicsManager, renderer){
        this.pos = {
            x: posx,
            y: posy, 
            z: posz,
        }
        this.rot = {
            x: rotx,
            y: roty, 
            z: rotz,
        }
        this.options = {
            radius: 0.5,
            height: 1.8,
            moveSpeed: 5,
            jumpForce: 7,
        };
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };
        this.offset = new THREE.Vector3(0, 0, -5);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.modelLocation = modelLocation;
        this.scene = scene;
        this.physicsManager = physicsManager;
        this.controller = this.physicsManager.world.createCharacterController(0.01);
        this.collider;
        this.body;
        this.mesh;
        this.velocity = new THREE.Vector3();
        this.isGrounded = false;
        this.renderer = renderer;

        this.initCharacter();
        this.initControls();
    }

    initCharacter() {
        // Character group (holds both visual and physics representations)
        this.characterGroup = new THREE.Group();
        this.scene.add(this.characterGroup);

        let modelLocation = this.modelLocation
        const fbxLoader = new FBXLoader()
        fbxLoader.load(
            modelLocation,
            (model) => {
                model.position.x = this.pos.x;
                model.position.y = this.pos.y;
                model.position.z = this.pos.z;
                model.rotation.x = this.rot.x;
                model.rotation.y = this.rot.y;
                model.rotation.z = this.rot.z;
                model.traverse((object) => {
                    if (object.isMesh) {
                        object.userData = {
                            interactable: false,
                        }
                    }
                });
                model.scale.set(.02, .02, .02);
                this.characterMesh = model
                this.characterMesh.castShadow = true;
                this.characterGroup.add(this.characterMesh);
            },
            (error) => {
                console.log(error)
            }
        );

        // Physics representation
        const characterRigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        this.characterRigidBody = this.physicsManager.world.createRigidBody(characterRigidBodyDesc);

        let height = this.options["height"]
        let radius = this.options["radius"]

        const characterColliderDesc = RAPIER.ColliderDesc.capsule(
            (height - radius) / 2, 
            radius
        );
        this.characterCollider = this.physicsManager.world.createCollider(
            characterColliderDesc, 
            this.characterRigidBody
        );

        // Character controller
        this.characterController = this.physicsManager.world.createCharacterController(0.01);
        //this.characterController.setUp(RAPIER.Vector3.yAxis());
        this.characterController.setOffset(0.1);
        this.characterController.setApplyImpulsesToDynamicBodies(true);
        this.characterController.setMaxSlopeClimbAngle(Math.PI / 4); // 45 degrees

        // Set initial position
        this.setPosition(0, 0, 0);

        // Add camera to character group
        this.characterGroup.add(this.camera);
    }

    initControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveState.forward = true; break;
                case 'KeyS': this.moveState.backward = true; break;
                case 'KeyA': this.moveState.left = true; break;
                case 'KeyD': this.moveState.right = true; break;
                case 'Space': this.moveState.jump = true; break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveState.forward = false; break;
                case 'KeyS': this.moveState.backward = false; break;
                case 'KeyA': this.moveState.left = false; break;
                case 'KeyD': this.moveState.right = false; break;
                case 'Space': this.moveState.jump = false; break;
            }
        });
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.controls.isLocked) {
                this.controls.lock();
            }
        });
    }

    setPosition(x, y, z) {
        this.characterRigidBody.setTranslation(
            new RAPIER.Vector3(x, y, z),
            true
        );
        this.characterGroup.position.set(x, y, z);
    }

    update(delta) {

        const lookDir = new THREE.Vector3(0, 0, -1);
        lookDir.applyQuaternion(this.camera.quaternion);
        lookDir.y = 0;
        lookDir.normalize();
        this.characterGroup.lookAt(this.characterGroup.position.clone().add(lookDir));

        let worldOffset = this.offset.clone().applyQuaternion(this.characterGroup.quaternion);
        this.camera.position.copy(this.characterGroup.position).add(worldOffset);
        // Calculate movement direction based on camera orientation
        const direction = new THREE.Vector3();
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();

        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        right.crossVectors(new THREE.Vector3(0, 1, 0), forward);
        right.normalize();

        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;

        // Apply movement based on input
        if (this.moveState.forward) this.velocity.add(forward);
        if (this.moveState.backward) this.velocity.sub(forward);
        if (this.moveState.left) this.velocity.add(right);
        if (this.moveState.right) this.velocity.sub(right);

        // Normalize and scale by speed
        if (this.velocity.length() > 0) {
            this.velocity.normalize();
            this.velocity.multiplyScalar(this.options.moveSpeed * delta);
        }

        // Check if grounded
        this.isGrounded = this.characterController.computedGrounded();

        // Handle jumping
        if (this.moveState.jump && this.isGrounded) {
            this.velocity.y = this.options.jumpForce * delta;
            this.moveState.jump = false;
        } else {
            this.velocity.y = 0;
        }

        // Move character controller
        this.characterController.computeColliderMovement(
            this.characterCollider,
            { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z }
        );

        // Apply the corrected movement
        const correctedMovement = this.characterController.computedMovement();
        this.characterRigidBody.setNextKinematicTranslation(
            new RAPIER.Vector3(
                this.characterRigidBody.translation().x + correctedMovement.x,
                this.characterRigidBody.translation().y + correctedMovement.y,
                this.characterRigidBody.translation().z + correctedMovement.z
            )
        );

        // Update Three.js group position to match physics
        const position = this.characterRigidBody.translation();
        this.characterGroup.position.set(position.x, position.y, position.z);
    }
}
