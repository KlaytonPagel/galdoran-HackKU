import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


export class PlayerCharacter{
    constructor(posx, posy, posz, rotx, roty, rotz, modelLocation, scene){
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
        this.mesh;
        this.modelLocation = modelLocation;
        this.fspeed = 0;
        this.sspeed = 0;
        this.maxSpeed = 5;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.playerControls;
        this.cameraControls;
        this.characterHeight = 2;
        this.zoomMax = 10;
        this.zoomMin = 1;
        this.offset = new THREE.Vector3(1, this.characterHeight, this.zoomMax - ((this.zoomMax - this.zoomMin) / 2));
        this.firstPersonOffset = new THREE.Vector3(0, this.characterHeight, 0);
        this.scene = scene;
        this.mesh;
        this.head;
        this.mixer;
        this.states = {}
        this.currentState="idle"
        this.createMesh(this.modelLocation, this.scene)
    }

    initialize(docRef) {
        this.setupControllers(docRef);
        this.keyBinds();
    }

    // ------------------------------------------ Create the mesh for the player character
    createMesh(modelLocation, scene){
        const fbxLoader = new FBXLoader()
        scene.add(this.camera);
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
                this.mesh = model;
                scene.add(model);

                // create the "head" of the character, this helps with camera controls
                const box = new THREE.Box3().setFromObject(model);
                let size = new THREE.Vector3();
                box.getSize(size)
                const headGeo = new THREE.BoxGeometry(0, 0, 0);
                const headMat = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
                this.head = new THREE.Mesh(headGeo, headMat);
                this.head.position.x = this.pos.x;
                this.head.position.y = this.pos.y+size.y;
                this.head.position.z = this.pos.z;
                this.head.rotation.x = this.rot.x;
                this.head.rotation.y = this.rot.y;
                this.head.rotation.z = this.rot.z;
                scene.add(this.head)
                this.setupAnimations();
            },
            (error) => {
                console.log(error)
            }
        );
    }

    keyBinds(){
        document.addEventListener('keydown', (event) => {
            if (event.key == 'w') {
                this.fspeed = this.maxSpeed;
                this.states["walking"].play()
            }
            if (event.key == 's') {
                this.fspeed = -this.maxSpeed;
                this.states["walking"].play()
            }
            if (event.key == 'd') {
                this.sspeed = this.maxSpeed;
                this.states["walking"].play()
            }
            if (event.key == 'a') {
                this.sspeed = -this.maxSpeed;
                this.states["walking"].play()
            }
            if (event.shiftKey) {
                if (this.fspeed == this.maxSpeed) {
                    this.fspeed = this.fspeed * 1.9;
                    this.states["walking"].stop()
                    this.states["running"].play()
                }
            }
        })
        document.addEventListener('keyup', (event) => {
            if (event.key == 'w') {
                this.fspeed = 0;
                this.states["walking"].stop()
            }
            if (event.key == 's') {
                this.fspeed = 0;
                this.states["walking"].stop()
            }
            if (event.key == 'd') {
                this.sspeed = 0;
                this.states["walking"].stop()
            }
            if (event.key == 'a') {
                this.sspeed = 0;
                this.states["walking"].stop()
            }
            if (event.key == "Shift") {
                if (this.fspeed >= this.maxSpeed) {
                    this.fspeed = this.maxSpeed;
                    this.states["running"].stop()
                    this.states["walking"].play()
                }
            }
        })
        document.addEventListener('click', (event) => {
            this.cameraControls.lock();
        })
        document.addEventListener('wheel', (event) => {
            if (event.deltaY > 0) {
                this.offset.z += .1;
                if (this.offset.z >= this.zoomMax) {
                    this.offset.z = this.zoomMax;
                }
            } else {
                this.offset.z -= .1;
            }
        })
    }

    setupAnimations() {
        this.mixer = new THREE.AnimationMixer(this.mesh);
        const clips = this.mesh.animations;
        //console.log(clips)
        this.states["walking"] = this.mixer.clipAction(THREE.AnimationClip.findByName(clips, "walking"));
        this.states["running"] = this.mixer.clipAction(THREE.AnimationClip.findByName(clips, "running"));
        this.states["idle"] = this.mixer.clipAction(THREE.AnimationClip.findByName(clips, "Armature|idle"));

        //this.states["idle"].play()
    }

    setupControllers(docRef) {
        this.playerControls = new PointerLockControls(this.head, docRef);
        this.cameraControls = new PointerLockControls(this.camera, docRef);
        this.camera.applyQuaternion(this.mesh.quaternion);
    }

    updateMovement(delta){
        // move the player forward
        this.playerControls.moveForward(this.fspeed*delta);
        this.playerControls.moveRight(this.sspeed*delta);

        // move the player mesh to follow the players "Head"
        this.mesh.position.x = this.head.position.x;
        this.mesh.position.z = this.head.position.z;
        const box = new THREE.Box3().setFromObject(this.mesh);
        let size = new THREE.Vector3();
        box.getSize(size)
        this.head.position.y = this.mesh.position.y+size.y

        // make the player face in the same Y direction as the camera
        const lookDir = new THREE.Vector3(0, 0, -1);
        lookDir.applyQuaternion(this.camera.quaternion);
        lookDir.y = 0;
        lookDir.normalize();
        this.mesh.lookAt(this.mesh.position.clone().add(lookDir));

        // set the camera offset based on the position of the head
        let worldOffset = this.offset.clone().applyQuaternion(this.head.quaternion);
        if (this.offset.z <= this.zoomMin) {
            worldOffset = this.firstPersonOffset.clone().applyQuaternion(this.head.quaternion);
        }
        this.camera.position.copy(this.head.position).add(worldOffset);
    }

    update(delta){
        this.updateMovement(delta);
        this.mixer.update(delta);
    }
}
