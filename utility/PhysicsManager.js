import * as THREE from 'three';
import * as CANNON from 'cannon-es'


export class PhysicsManager {
    constructor(){
        this.objects = {};

        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.82, 0)
    }

    addCube(cubeMesh) {
        const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
        const cubeBody = new CANNON.Body({ mass: 1 })
        cubeBody.addShape(cubeShape)
        cubeBody.position.x = cubeMesh.position.x;
        cubeBody.position.y = cubeMesh.position.y;
        cubeBody.position.z = cubeMesh.position.z;
        cubeBody.quaternion.set(cubeMesh.quaternion.x, cubeMesh.quaternion.y, cubeMesh.quaternion.z, cubeMesh.quaternion.w);
        this.world.addBody(cubeBody);
        this.objects[Object.keys(this.objects).length] = [cubeMesh, cubeBody];
    }

    addPlane(planeMesh) {
        const planeShape = new CANNON.Plane();
        const planeBody = new CANNON.Body({ mass: 0 });
        planeBody.addShape(planeShape);
        planeBody.position.x = planeMesh.position.x;
        planeBody.position.y = planeMesh.position.y;
        planeBody.position.z = planeMesh.position.z;
        planeBody.quaternion.set(planeMesh.quaternion.x, planeMesh.quaternion.y, planeMesh.quaternion.z, planeMesh.quaternion.w);
        this.world.addBody(planeBody);
        this.objects[Object.keys(this.objects).length] = [planeMesh, planeBody];
    }

    update(delta) {
        for (const [key, value] of Object.entries(this.objects)) {
            const mesh = value[0];
            const body = value[1];
            mesh.position.x = body.position.x;
            mesh.position.y = body.position.y;
            mesh.position.z = body.position.z;
            mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);

            //console.log(`${key}: ${value[0].position}`)
        }
        this.world.step(delta)
    }
}
