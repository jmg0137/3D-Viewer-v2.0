import {Particle} from "./Particle.js";

/**
 * @fileoverview A type of particle that is specific for spheres.
 */

export class Sphere extends Particle {
    /**
     * @constructor
     * @class Hold a Sphere and its functionality.
     * @param {Scene} myScene - The scene the sphere belongs to.
     * @param {THREE.Color} defaultColor - The default color the sphere must have.
     * @param {THREE.Color} highlightedColor - The color the sphere would have when it is highlighted.
     */
    constructor(myScene, defaultColor, highlightedColor) {
        super(myScene, defaultColor, highlightedColor);
    }

    /**
     * It adds a sphere to the scene.
     * 
     * @param {THREE.Vector3} point - Point where to attach the sphere.
     */
    add(point){
        let colorToUse = this.defaultColor;
        let sphereMaterial = new THREE.MeshPhongMaterial({color: colorToUse});
        let sphereGeometry = new THREE.SphereGeometry(this.myScene.radius);
        let sphereMesh = new THREE.Mesh(sphereGeometry,sphereMaterial);
        sphereMesh.translateX(point.x);
        sphereMesh.translateY(point.y);
        sphereMesh.translateZ(point.z);
        sphereMesh.name = "Annotation";
        sphereMesh.userData = "an annotation";
        this.myScene.add(sphereMesh);
        this.threeObject = sphereMesh;
    }

    /**
     * Removes the sphere from the scene.
     */
    clear() {
        this.myScene.remove(this.threeObject);
        this.threeObject = null;
    }

    /**
     * Toggles the color of the sphere from default to highlighted and viceversa.
     */
    toggleColor() {
        let objectColor = this.threeObject.material.color;
        if (objectColor.equals(this.defaultColor)) {
            this.threeObject.material.color = this.highlightedColor;
        } else if (objectColor.equals(this.highlightedColor)) {
            this.threeObject.material.color = this.defaultColor;
        } else {
            console.warn("Problem during toggling a color");
        }
    }
}