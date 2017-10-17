/**
 * @fileoverview An abstract element to describe a compound element.
 */

export class AbstractElement {
    /**
     * @constructor
     * @class Holds many instances of Particle derivates and handle them as one.
     * @param {Scene} myScene - The scene which the Element belongs to.
     * @param {THREE.Color} defaultColor - The default color the elements will have.
     * @param {THREE.Color} highlightedColor - The color the elements will have when they are highlighted.
     */
    constructor(myScene, defaultColor, highlightedColor) {
        if (this.constructor === AbstractElement) {
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
        if (this.__lookupGetter__("mainParticle") === undefined) {
            throw new TypeError("mainParticle getter method must be implemented");
        }
        this.myScene = myScene;
        this.defaultColor = defaultColor;
        this.highlightedColor = highlightedColor;
    }
}