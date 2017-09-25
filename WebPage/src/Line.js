import {Particle} from "./Particle.js";

/**
 * @fileoverview A type of particle that is specific for lines.
 */

export class Line extends Particle {
    /**
     * @constructor
     * @class Line class, just to hold a Line.
     * @param {Scene} myScene - The scene which will hold the line.
     * @param {THREE.Color} defaultColor - The default color the line will have.
     * @param {THREE.Color} highlightedColor - The color the line will have when it's highlighted.
     */
    constructor(myScene, defaultColor, highlightedColor) {
        super(myScene, defaultColor, highlightedColor);
    }

    /**
     * It adds the line between two particles, and binds to them.
     * 
     * @param {Particle} particleA - First particle which the line is attaching.
     * @param {Particle} particleB - Second particle which the line is attaching.
     */
    add(particleA, particleB){
        let material = new THREE.LineBasicMaterial();
        let geometry = new THREE.Geometry();
        let pointA = particleA.threeObject.position, pointB = particleB.threeObject.position;
        geometry.vertices.push(pointA, pointB);
        let line = new THREE.Line(geometry, material);
        line.add(particleA.threeObject);
        line.add(particleB.threeObject);
        this.myScene.add(line);
        this.threeObject = line;
    }

    /**
     * It removes the line from the scene.
     */
    clear() {
        this.myScene.remove(this.threeObject);
        this.threeObject = null;
    }

    /**
     * This method remains unimplemented due to the lack of reasons.
     * @throws {TypeError} Whenever is used: it's unimplemented!
     */
    toggleColor() {
        throw new TypeError("Unimplemented method");
    }
}