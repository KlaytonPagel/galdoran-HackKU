import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


export class PhysicsCharacter{
    constructor(posx, posy, posz, rotx, roty, rotz, modelLocation, scene, physicsManager){
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
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.y = 20
        this.camera.position.z = 10
    }
}
