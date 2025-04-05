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

function convertToHeightMatrix(geometry, resolution = 100) {
    geometry.computeBoundingBox();
    const { min, max } = geometry.boundingBox;
    const width = max.x - min.x;
    const depth = max.z - min.z;

    const matrix = [];
    for (let x = 0; x < resolution; x++) {
        matrix[x] = [];
        for (let z = 0; z < resolution; z++) {
            // 샘플링 위치 계산
            const sampleX = min.x + (x / (resolution - 1)) * width;
            const sampleZ = min.z + (z / (resolution - 1)) * depth;

            // 지오메트리에서 해당 위치에 가장 가까운 vertex의 Y값을 찾기
            const closest = geometry.attributes.position.array;
            let minDist = Infinity;
            let height = 0;

            for (let i = 0; i < closest.length; i += 3) {
                const vx = closest[i];
                const vy = closest[i + 1];
                const vz = closest[i + 2];
                const dist = Math.hypot(sampleX - vx, sampleZ - vz);
                if (dist < minDist) {
                    minDist = dist;
                    height = vy;
                }
            }

            matrix[x][z] = height;
        }
    }
    return matrix;
}

async function loadTerrain(){
    const fbxLoader = new FBXLoader();
    let terrain = await new FBXLoader().loadAsync('./3DModels/LandscapeTest1.fbx');
    let terrainMesh;
    terrain.traverse((child) => {
        if(child.isMesh){
            terrainMesh = child;
        }
    })
    scene.add(terrainMesh);
    terrainMesh.rotateX(Math.PI/2);
    terrainMesh.position.setY(1500);
    //console.log(terrainMesh);

    const testTexture = new THREE.TextureLoader().load('./textures/gray_rocks_diff.jpg');
    testTexture.wrapS = THREE.RepeatWrapping;
    testTexture.wrapT = THREE.RepeatWrapping;
    testTexture.repeat.set(1, 1);
    terrainMesh.material.map = testTexture;

    const heightMatrix = convertToHeightMatrix(terrainMesh.geometry, 100);
    const shape = new CANNON.Heightfield(heightMatrix, {
        elementSize: 1
    });
    const body = new CANNON.Body({
        mass: 0,
        shape: shape
    });

    body.position.set(-heightMatrix.length / 2, 0, -heightMatrix[0].length / 2);
    world.addBody(body);
}
loadTerrain();



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
