import * as THREE from 'three';


export class SkyBox {
    constructor(scene) {
        const materialArray = this.createMaterialArray();
        const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
        this.skybox = new THREE.Mesh(skyboxGeo, materialArray);
        this.skybox.position.y = -2000
        scene.add(this.skybox);
    }

    createMaterialArray() {
        const skyboxImagepaths = this.createPathStrings();
        const materialArray = skyboxImagepaths.map(image => {
            const texture = new THREE.TextureLoader().load(image);
            return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
        });
        return materialArray;
    }

    createPathStrings() {
        const basePath = "hdri/sky_17_2k/sky_17_cubemap_(roblox)_2k/";
        const fileType = ".png";
        const sides = ["px", "nx", "py", "ny", "pz", "nz"];
        const pathStings = sides.map(side => {
            return basePath + side + fileType;
        });

        return pathStings;
    }

    animate(delta) {
        this.skybox.rotation.y += .003 * delta;
    }
}
