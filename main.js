import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Icosahedron } from './objects/Icosahedron';
import { Plane } from './objects/Plane';
import { PlayerCharacter } from './characters/player';
import { Tree01 } from './objects/Tree01';
import { PhysicsManager } from'./utility/PhysicsManager'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setAnimationLoop( animate );
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// -------------------------------------------------------- Setting up the scene
const scene = new THREE.Scene();

// -------------------------------------------------------- Lights
const light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
scene.add( light );

// ------------------------------------------------------- Player
const player = new PlayerCharacter(0, 0, 0, 0, 0, 0, "models/galdoran-player.fbx", scene);
player.offset = new THREE.Vector3(1, 0, 5);

// ------------------------------------------------------- build out the floor
const ground = new Plane(0,0 , 0, 100, 100, -Math.PI/2, 0, 0, 0x555555, "textures/ground01.jpg");
scene.add(ground.mesh);

// ############################ THE TESTING ZONE #############################

const physicsManager = new PhysicsManager();

physicsManager.addPlane(ground.mesh);


const normalMaterial = new THREE.MeshNormalMaterial();
const cube = new THREE.BoxGeometry(1, 1, 1);
const cubeMesh = new THREE.Mesh(cube. normalMaterial);
scene.add(cubeMesh);
cubeMesh.position.y = 100;
cubeMesh.position.x = 0;
cubeMesh.position.z = 0;
physicsManager.addCube(cubeMesh);


/*const fbxLoader = new FBXLoader()
fbxLoader.load(
    "models/LandscapeTest1.fbx",
    (model) => {
        model.position.y = 0;
        model.rotation.x = -90;
        model.scale.set(.1, .1, .1);
        scene.add(model);
    },
    (error) => {
        console.log(error)
    }
);*/



// ###########################################################################

// -------------------------------------------------------- Animation Loop
const clock = new THREE.Clock()
let delta
function animate() {
    delta = Math.min(clock.getDelta(), 0.1)
    if (player.mesh != undefined){
        if (player.playerControls == undefined) {
            player.initialize(renderer.domElement);
        }
        player.update(delta);
    }

    // ############################ The Tesing Animation Zone #################




    physicsManager.update(delta);




    // ########################################################################
    renderer.render( scene, player.camera );
}
