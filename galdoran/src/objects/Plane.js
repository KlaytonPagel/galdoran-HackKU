import * as THREE from 'three';
export class Plane {
    constructor(x, y, z, width, height, rx, ry, rz, color, texture_path=null){
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.color = color;
        this.texture_path = texture_path;
        this.mesh = this.makePlane()
    }
    makePlane(){
        const geometry = new THREE.PlaneGeometry( this.width, this.height );
        let material = new THREE.MeshBasicMaterial( {color: this.color, side: THREE.DoubleSide} );
        let plane = new THREE.Mesh( geometry, material );
        // if given a texture path load the texture
        if (this.texture_path != null) {
            let texture = new THREE.TextureLoader().load(this.texture_path);
            texture.repeat = new THREE.Vector2(10, 10);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            material = new THREE.MeshStandardMaterial({
                map: texture,
            });
            plane = new THREE.Mesh(geometry, material);
        }

        plane.position.x = this.x;
        plane.position.y = this.y;
        plane.position.z = this.z;
        plane.rotation.x = this.rx;
        plane.rotation.y = this.ry;
        plane.rotation.z = this.rz;
        return plane;
    }
}
