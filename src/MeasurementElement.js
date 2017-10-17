import {AbstractElement} from "./AbstractElement.js";
import {Line} from "./Line.js";
import {Sphere} from "./Sphere.js";

/**
 * @fileoverview A type of element that is specific for measurements.
 */

export class MeasurementElement extends AbstractElement {
    /**
     * @constructor
     * @class AbstractElement, to hold the components that belongs to a measurement.
     * @param {Scene} myScene - The scene which the measurement belongs to.
     * @param {THREE.Color} defaultColor - The defaultColor the spheres of the measurement should have.
     * @param {THREE.Color} highlightedColor - The color the spheres will have when they are highlighted.
     */
    constructor(myScene, defaultColor, highlightedColor) {
        super(myScene, defaultColor, highlightedColor);
        this.sphere1 = null;
        this.sphere2 = null;
        this.line = null;
    }

    /**
     * It adds a sphere into the specified point. When the two spheres are already set up, it
     * adds a line in between.
     * 
     * @param {THREE.Vector3} point - Point where the actual sphere should be put.
     */
    add(point) {
        if (this.sphere1 === null) {
            this.sphere1 = new Sphere(this.myScene, this.defaultColor, this.highlightedColor);
            this.sphere1.add(point);
        } else if (this.sphere2 === null) {
            this.sphere2 = new Sphere(this.myScene, this.defaultColor, this.highlightedColor);
            this.sphere2.add(point);
            this.line = new Line(this.myScene);
            this.line.add(this.sphere1, this.sphere2);
            this.line.threeObject.userData = "a measurement";
        } else {
            throw new Error("Cannot call add more times.")
        }
    }

    /**
     * Removes all the elements of a measurement.
     */
    clear() {
        this.sphere1.clear();
        this.sphere = null;

        this.sphere2.clear();
        this.sphere2 = null;

        this.line.clear();
        this.line = null;
    }

    /**
     * Toggles the color of the spheres of the measurement.
     */
    toggleColor() {
        if (this.sphere1 === null || this.sphere2 === null) {
            throw new Error("This measurement has no particles to change color to.");
        } else {
            this.sphere1.toggleColor();
            this.sphere2.toggleColor();
        }
    }

    /**
     * Checks if the measurement is complete.
     * 
     * @return {boolean} True if the measurement has all of its elements, false if not.
     */
    isComplete() {
        return this.sphere1 !== null && this.sphere2 !== null && this.line !== null;
    }

    /**
     * Getter for the main property (the line on this case).
     * 
     * @return {Particle} The main particle of the element.
     */
    get mainParticle() {
        return this.line;
    }

    /**
     * Gives the threeObjects of the particles.
     * 
     * @return {Array} An array containing the objects of THREE.Object3D which are
     * contained into the instance.
     */
    get threeObjects() {
        
        if (this.sphere1 !== null && this.sphere2 !== null) {
            return [this.sphere1.threeObject, this.sphere2.threeObject];
        } else if (this.sphere2 !== null) {
            return [this.sphere2.threeObject];
        } else if (this.sphere1 !== null) {
            return [this.sphere1.threeObject];
        }
    }
}