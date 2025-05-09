import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { Icosahedron } from './objects/Icosahedron';
import { Plane } from './objects/Plane';
import { PlayerCharacter } from './characters/player';
import { PhysicsCharacter } from './characters/physicsPlayer';
import { Tree01 } from './objects/Tree01';
import { PhysicsManager } from'./utility/PhysicsManager'
import { SkyBox } from'./utility/SkyBox'
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
const hemilight = new THREE.HemisphereLight( 0xffffff, 0xffffff, .3 );
scene.add( hemilight );

const amblight = new THREE.AmbientLight( 0x404040, 5 ); // soft white light
scene.add( amblight );

const light = new THREE.DirectionalLight( 0xFFFFFF );
scene.add( light );
light.position.set(2, 10, 1);
light.target.position.set(0, 0, 0);
scene.add(light.target)

// ------------------------------------------------------- Player
const player = new PlayerCharacter(0, 0, 0, 0, 0, 0, "models/galdoran-character.fbx", scene, physicsManager);
player.offset = new THREE.Vector3(1, 0, 5);
//const player = new PhysicsCharacter(0, 0, 0, 0, 0, 0, "models/galdoran-player.fbx", scene, physicsManager, renderer);

// ------------------------------------------------------ Loading Screen
const loadingScreen = document.getElementById("loading-screen");


// ############################ THE TESTING ZONE #############################

//const controls = new OrbitControls( player.camera, renderer.domElement );

//sky box test
const sky = new SkyBox(scene)
const cullable = []
const ground = []

//terrain test
async function loadTerrain() {
    let texture = new THREE.TextureLoader().load('textures/T_GrassTerrain_01_01_C1.PNG');
    texture.repeat = new THREE.Vector2(.6, .6);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let material = new THREE.MeshStandardMaterial({
        map: texture,
    });
    try {
        const gltf = await new GLTFLoader().loadAsync('models/GaldoranPort.glb');
        const terrain = gltf.scene;
        terrain.children[0].traverse((child) => {
            if (child.isMesh) {
                child.material = material;
                ground.push(child);
            }
        });
        terrain.children[1].traverse((child) => {
            if (child.isMesh) {
                cullable.push(child);
            }
        });
        scene.add(terrain);
    } catch (error) {
        console.error("Error loading terrain:", error, "trying again");
        loadTerrain();
    }
}
loadTerrain();

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







//physicsManager.createPlane(scene);
//physicsManager.createCube(scene);

// ###########################################################################
function culling() {
    for (let i = 0; i < cullable.length; i++) {
        const pos = new THREE.Vector3()
        cullable[i].getWorldPosition(pos)
        if (player.mesh.position.distanceTo(pos) > 500) {
            cullable[i].visible = false
        } else {
            cullable[i].visible = true
        }
    }
}

// -------------------------------------------------------- Animation Loop
const clock = new THREE.Clock()
let delta
function animate() {
    delta = Math.min(clock.getDelta(), 0.1)
    if (player.mesh != undefined){
        if (player.playerControls == undefined) {
            player.initialize(renderer.domElement);
        }
        player.update(delta, ground);
        
    }
    physicsManager.update(delta);
    sky.animate(delta);
    culling();

    // ############################ The Tesing Animation Zone #################



    //player.update(delta);




    // ########################################################################
    if (ground.length > 0 && loadingScreen.style.display != 'none') {
        loadingScreen.style.display = 'none';
    }
    renderer.render( scene, player.camera );
}
