import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Icosahedron } from './objects/Icosahedron';
import { Plane } from './objects/Plane';
import { PlayerCharacter } from './characters/player';
import { PhysicsCharacter } from './characters/physicsPlayer';
import { Tree01 } from './objects/Tree01';
import { PhysicsManager } from'./utility/PhysicsManager'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setAnimationLoop( animate );
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// -------------------------------------------------------- Setting up the scene
const scene = new THREE.Scene();
const physicsManager = new PhysicsManager();

async function initPhysics() {
    // Load the Rapier wasm module
    await RAPIER.init();

    // Create physics world
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    physicsWorld = new RAPIER.World(gravity);
}

// -------------------------------------------------------- Lights
const light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
scene.add( light );

// ------------------------------------------------------- Player
//const player = new PlayerCharacter(0, 0, 0, 0, 0, 0, "models/galdoran-player.fbx", scene, physicsManager);
//player.offset = new THREE.Vector3(1, 0, 5);
const player = new PhysicsCharacter(0, 0, 0, 0, 0, 0, "models/galdoran-player.fbx", scene, physicsManager);
//const controls = new OrbitControls( player.camera, renderer.domElement );

// ------------------------------------------------------- build out the floor
const ground = new Plane(0,0 , 0, 100, 100, -Math.PI/2, 0, 0, 0x555555, "textures/ground01.jpg");
scene.add(ground.mesh);

// ############################ THE TESTING ZONE #############################
const pmremGenerator = new THREE.PMREMGenerator( renderer );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const hdriLoader = new RGBELoader()
hdriLoader.load( 'hdri/GaldoranSky.hdr', function ( texture ) {
    scene.environment = texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
} );



const loader = new GLTFLoader();
loader.load( 'models/Terrain2.glb', 
    function ( gltf ) {
        let model = gltf.scene;
        scene.add(model);
    });

/*const fbxLoader = new FBXLoader()
fbxLoader.load(
    "models/Terrain.fbx",
    (model) => {
        model.position.y = 0;
        model.rotation.x = 0;
        model.scale.set(.02, .02, .02);
        scene.add(model);
        model.traverse((object) => {
            if (object.name == "PCGStamp") {
                for (let i = 0; i < object.children.length; i++) {
                    object.children[i].position.x = 0;
                    object.children[i].position.y = 0;
                    object.children[i].position.z = 0;
                    console.log(object.children[i])
                }
            }
        });
    },
    (error) => {
        console.log(error)
    }
);*/







physicsManager.createPlane(scene);
physicsManager.createCube(scene);

// ###########################################################################

// -------------------------------------------------------- Animation Loop
const clock = new THREE.Clock()
let delta
function animate() {
    delta = Math.min(clock.getDelta(), 0.1)
    /*if (player.mesh != undefined){
        if (player.playerControls == undefined) {
            player.initialize(renderer.domElement);
        }
        player.update(delta);
    }*/
    physicsManager.update(delta);

    // ############################ The Tesing Animation Zone #################








    // ########################################################################
    renderer.render( scene, player.camera );
}
