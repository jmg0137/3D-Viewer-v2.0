/**
 * @fileoverview Abstract class for THREE.Object3D objects.
 */

export class Particle {
    /**
     * @constructor
     * @class Particle class, to provide functionality common to the THREE.Object3D objects.
     * @abstract
     * @param {Scene} myScene - The scene which this particle belongs to.
     * @param {THREE.Color} defaultColor -  The default color the object instance must have.
     * @param {THREE.Color} hightlightedColor - The color the instance must have when it's hightlighted.
     */
    constructor(myScene, defaultColor, highlightedColor) {
        this.myScene = myScene;
        this.defaultColor = defaultColor;
        this.highlightedColor = highlightedColor;
        this.threeObject = null;
        if (this.constructor === Particle) {
            throw new TypeError("Abstract class 'AbstractElement' cannot be instantiated.");
        }
        if (this.toggleColor === undefined) {
            throw new TypeError("toggleColor method must be implemented.");
        }
        if (this.clear === undefined) {
            throw new TypeError("clear method must be implemented.");
        }
        if (this.add === undefined) {
            throw new TypeError("add method must be implemented.");
        }
    }

    /**
     * Getter for the uuid property on the threeObject.
     */
    get uuid() {
        return this.threeObject.uuid;
    }
}