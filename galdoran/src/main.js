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
import * as RAPIER from '@dimforge/rapier3d';


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
    //await RAPIER.init();

    // Create physics world
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    return new RAPIER.World(gravity);
}
const physicsWorld = await initPhysics();

// -------------------------------------------------------- Lights
const light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
scene.add( light );

// ------------------------------------------------------- Player
//const player = new PlayerCharacter(0, 0, 0, 0, 0, 0, "models/galdoran-player.fbx", scene, physicsManager);
//player.offset = new THREE.Vector3(1, 0, 5);
const player = new PhysicsCharacter(0, 0, 0, 0, 0, 0, "models/galdoran-player.fbx", scene, physicsManager);
const controls = new OrbitControls( player.camera, renderer.domElement );

// ------------------------------------------------------- build out the floor
const ground = new Plane(0,0 , 0, 100, 100, -Math.PI/2, 0, 0, 0x555555, "textures/ground01.jpg");
//scene.add(ground.mesh);

// ------------------------------------------------------- load the terrain
async function loadTerrain() {
    try {
        const gltf = await new GLTFLoader().loadAsync('models/Terrain2.glb');
        const terrain = gltf.scene;
        scene.add(terrain);

        let allVertices = [];
        let allIndices = [];
        let vertexOffset = 0;
        const landscape = terrain.getObjectByName('Landscape');
        console.log(landscape.position, landscape.scale, landscape.rotation);
        landscape.traverse(child => {
            // if (child.name == 'Landscape') {
            //   geometry = child.geometry;
            //   console.log(child);
            // }
            if (child.isMesh && child.geometry && child.geometry.attributes.position) {
                const geometry = child.geometry;

                const positions = geometry.attributes.position.array;
                const indices = geometry.index ? geometry.index.array : createSequentialIndices(positions);

                // 정점 추가
                for (let i = 0; i < positions.length; i++) {
                    allVertices.push(positions[i]);
                }

                // 인덱스 추가 (vertex 오프셋 고려)
                for (let i = 0; i < indices.length; i++) {
                    allIndices.push(indices[i] + vertexOffset);
                }

                vertexOffset += positions.length / 3; // 정점 수 업데이트
            }
        });
        const verticesTyped = new Float32Array(allVertices);
        const indicesTyped = new Uint32Array(allIndices);
        visualizeTrimesh(verticesTyped, indicesTyped);
        const colliderDesc = RAPIER.ColliderDesc.trimesh(verticesTyped, indicesTyped);
        console.log(colliderDesc);

        const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
            landscape.getWorldPosition(new THREE.Vector3()).x,
            landscape.getWorldPosition(new THREE.Vector3()).y,
            landscape.getWorldPosition(new THREE.Vector3()).z
        );
        const body = physicsWorld.createRigidBody(bodyDesc);
        physicsWorld.createCollider(colliderDesc, body);
    } catch (error) {
        console.error("Error loading terrain:", error);
    }
}
loadTerrain();

function createSequentialIndices(positionArray) {
    const count = positionArray.length / 3;
    const indices = [];
    for (let i = 0; i < count; i++) indices.push(i);
    return indices;
  }

// ############################ THE TESTING ZONE #############################

function visualizeTrimesh(vertices, indices, color = 0xff0000, scale = 100) {
    const geometry = new THREE.BufferGeometry();
    const lineVertices = [];

    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;

        const a = new THREE.Vector3(vertices[i0] * scale, vertices[i0 + 1] * scale, vertices[i0 + 2] * scale);
        const b = new THREE.Vector3(vertices[i1] * scale, vertices[i1 + 1] * scale, vertices[i1 + 2] * scale);
        const c = new THREE.Vector3(vertices[i2] * scale, vertices[i2 + 1] * scale, vertices[i2 + 2] * scale);

        // 삼각형의 세 변을 선분으로 추가
        lineVertices.push(...a.toArray(), ...b.toArray());
        lineVertices.push(...b.toArray(), ...c.toArray());
        lineVertices.push(...c.toArray(), ...a.toArray());
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));

    const material = new THREE.LineBasicMaterial({ color });
    const wireframe = new THREE.LineSegments(geometry, material);

    scene.add(wireframe);
}

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


//sky box test
const sky = new SkyBox(scene)


//terrain test
async function loadTerrain() {
    try {
        const gltf = await new GLTFLoader().loadAsync('models/Terrain2.glb');
        const terrain = gltf.scene;
        scene.add(terrain);
    } catch (error) {
        console.error("Error loading terrain:", error);
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







// physicsManager.createPlane(scene);
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



    sky.animate(delta);




    // ########################################################################
    renderer.render( scene, player.camera );
}
