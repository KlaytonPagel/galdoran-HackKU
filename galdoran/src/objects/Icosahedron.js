import * as THREE from 'three';
export class Icosahedron {
    constructor(x, y, z, radius, detail, rx, ry, rz, color, texture_path=null){
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = radius;
        this.detail = detail;
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.color = color;
        this.texture_path = texture_path
        this.mesh = this.makeIcosahedron();
    }

    makeIcosahedron(){

        // build the material and geometry 
        let geo = new THREE.IcosahedronGeometry(this.radius, this.detail);
        let mat = new THREE.MeshStandardMaterial({
            flatShading: true,
            color: this.color,
            metalness: 0.5,
        });
        geo.castShadow = true;
        mat.castShadow = true;
        let mesh = new THREE.Mesh(geo, mat);

        // if given a texture path load the texture
        if (this.texture_path != null) {
            var texture = new THREE.TextureLoader().load(this.texture_path);
                mat = new THREE.MeshStandardMaterial({
                    map: texture,
                });
            mat.castShadow = true;
            mesh = new THREE.Mesh(geo, mat);
        }
        mesh.position.x = this.x;
        mesh.position.y = this.y;
        mesh.position.z = this.z;
        mesh.rotation.x = this.rx;
        mesh.rotation.y = this.ry;
        mesh.rotation.z = this.rz;

        // ---------------- Wire Mesh Geometry for Ico __
        /*const wireMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe:true
        });
        const wireMesh = new THREE.Mesh(geo, wireMat);
        wireMesh.scale.setScalar(1.001);
        mesh.add(wireMesh);*/
        return mesh;
    }
}
