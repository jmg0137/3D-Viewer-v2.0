import {Utils} from "./Utils.js";

/**
 * @fileoverview AbstractTool to manage whatever elements we want.
 */

export class AbstractTool {
    /**
     * @constructor
     * @class Abstract tool to handle elements that are into the scene and represent them into a minimal GUI.
     * @param {Scene} myScene - Scene that the elements will belong.
     */
    constructor(myScene) {
        if (this.constructor === AbstractTool) {
            throw new TypeError("Abstract class 'AbstractTool' cannot be instantiated.");
        }
        if (this.__initParticleMenu === undefined) {
            throw new TypeError("__initParticleMenu method must be implemented");
        }
        if (this.__selectParticleEventListener === undefined) {
            throw new TypeError("__selectParticleEventListener method must be implemented");
        }
        if (this.__addParticleDisposableEvent === undefined) {
            throw new TypeError("__addParticleDisposableEvent method must be implemented");
        }
        if (this.__removeParticleEventListener === undefined) {
            throw new TypeError("__removeParticleEventListener method must be implemented");
        }
        if (this.__removeParticleDisposableEvent === undefined) {
            throw new TypeError("__removeParticleDisposableEvent method must be implemented");
        }
        if (this.removeParticle === undefined) {
            throw new TypeError("removeParticle method must be implemented");
        }
        if (this.toggleColor === undefined) {
            throw new TypeError("toggleColor method must be implemented");
        }
        this.myScene = myScene;
        this.elements = [];
        this.__selectParticleEventListener();
        this.__initParticleMenu();
        this.__initAddButton();
        this.__initUnselectButton();
        this.__initRemoveButton();
        this.__initEditButton();
        this.__addParticleDisposableEvent = this.__addParticleDisposableEvent.bind(this);
        this.__removeParticleDisposableEvent = this.__removeParticleDisposableEvent.bind(this);
    }

    /**
     * Add a disposable event listener to wait and select where we want to put a particle.
     * When its done, it auto removes.
     */
    __addParticleEventListener(){
        Utils.changeCursor(this.myScene.canvasNode, "copy");
        this.myScene.canvasNode.addEventListener("mousedown", this.__addParticleDisposableEvent);
    }

    /**
     * Add an event listener to wait for a mousedown and catch what particle will
     * be selected (on the model) and removed. When it's done, it auto removes.
     */
    __removeParticleEventListener(){
        Utils.changeCursor(this.myScene.canvasNode, "pointer");
        this.myScene.canvasNode.addEventListener("mousedown", this.__removeParticleDisposableEvent);
    }

    /**
     * Change the value of the the tag to the indicated element.
     * 
     * @param {String} uuid - The uuid of the element we want to change its tag.
     * @param {String} finalTagValue - The value which the tag of the element will have.
     */
    __changeTagValue(uuid, finalTagValue){
        for (let particle of this.elements) {
            if (particle.mainParticle.uuid === uuid) {
                particle.mainParticle.threeObject.userData = finalTagValue;
                break;
            }
        }
    }

    /**
     * Searches the elements list to delete an object.
     * 
     * @param {Element} deletingObject - The element we want to erase.
     */
    __removeElement(deletingObject){
        for (let element of this.elements) {
            if (element.mainParticle.threeObject === deletingObject) {
                this.removeParticle(element);
                break;
            }
        }
    }
}