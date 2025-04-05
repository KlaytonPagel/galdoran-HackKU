import * as THREE from 'three';

export class AnimationManager{
    constructor(mesh){
        this.animations = {};
        this.states = {};
        this.current_state = null;
        this.mixer = new THREE.AnimationMixer(this.mesh);
        this.clips = mesh.animations;
    }

    buildAnimations(animationsList) {
        for (const [key, value] of Object.entries(animationsList)) {
            try {
                this.animations[key] = this.mixer.clipAction(THREE.AnimationClip.findByName(this.clips, value));
            }
            catch(err) {
                console.log("Animation Not it Clips\n", err);
            }
        }
    }
}
