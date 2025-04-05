import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export class Tree01 {
    constructor(x, y, z, rx, ry, rz, scale, scene, collisionManager) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.scale = scale;
        this.scene = scene;
        this.collisionManager = collisionManager;
        this.buildTree();
    }

    interact(model) {
        model.rotation.y += .5;
    }

    buildTree() {
        const loader = new GLTFLoader();
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const scene = this.scene;
        const interact = this.interact;
        const collisionManager = this.collisionManager;

        loader.load( 'models/tree01.glb', 
            function ( gltf ) {
                let model = gltf.scene;
                model.position.x = x;
                model.position.y = y;
                model.position.z = z;
                model.traverse((object) => {
                    if (object.isMesh) {
                        collisionManager.addCollider(object);
                        object.userData = {
                            interactable: true,
                            interact: function() {
                                interact(model);
                            }
                        }
                    }
                });
                model.userData = {interactable: true};
                scene.add(model);
            }, undefined, function ( error ) {

                console.error( error );

            } );
    }
}
