import {AbstractElement} from "./AbstractElement.js";
import {Sphere} from "./Sphere.js";

/**
 * @fileoverview An annotation element will hold the particles that are needed.
 */

export class AnnotationElement extends AbstractElement {
    /**
     * @constructor
     * @class An AnnotationElement extends the AbstractElement and has the needed elements to work with annotations.
     * @param {Scene} myScene - The scene that the annotation belongs to.
     * @param {THREE.Color} defaultColor - The defaultColor the annotation should have.
     * @param {THREE.Color} hightlightedColor - The color that the annotation should show when it's highlighted.
     */
    constructor(myScene, defaultColor, highlightedColor) {
        super(myScene, defaultColor, highlightedColor);
        this.sphere = null;
    }

    /**
     * It adds an annotation to the scene.
     * 
     * @param {THREE.Vector3} point - Point where the annotation should been added.
     */
    add(point) {
        if (this.sphere === null) {
            this.sphere = new Sphere(this.myScene, this.defaultColor, this.highlightedColor);
            this.sphere.add(point);
        } else {
            throw new Error("This annotation already has a sphere.")
        }
    }

    /**
     * Removes the annotation.
     */
    clear() {
        this.sphere.clear();
        this.sphere = null;
    }

    /**
     * Toggles the color back and forth from defaultColor to highlightedColor.
     */
    toggleColor() {
        if (this.sphere === null) {
            throw new Error("This annotation has no sphere to change color to.");
        } else {
            this.sphere.toggleColor();
        }
    }

    /**
     * Getter for the main particle of the element (the sphere on this case).
     * 
     * @return {Particle} The main particle of the element.
     */
    get mainParticle() {
        return this.sphere;
    }
}