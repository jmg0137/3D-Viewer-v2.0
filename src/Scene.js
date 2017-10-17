import {Utils} from "./Utils.js";

/**
 * @fileoverview File that manages all the stuff related to the THREE.Scene.
 */

export class Scene {
    /**
     * @constructor
     * @class Holds all the attributes that are needed to do the basics on it.
     * @param {string} canvasIdentifier - The identifier of the canvas the scene must be created into.
     * @param {number} near - Near parameter of the camera.
     * @param {number} far - Far parameter of the camera.
     */
    constructor (canvasIdentifier, near, far) {
        this.threeScene = new THREE.Scene();
        this.canvasNode = document.getElementById(canvasIdentifier);
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvasNode});
        this.renderer.setSize(this.canvasNode.clientWidth, this.canvasNode.clientHeight, false);
        this.camera = new THREE.PerspectiveCamera(75, this.canvasNode.clientWidth/this.canvasNode.clientHeight, near, far);
        this.camera.position.set(0,0,500);
        this.threeScene.add(this.camera);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.__attachUpdateMouseCoordinatesEventListener();
        this.__attachResizeCanvasEventListener();
    }

    /**
     * This method creates two types of lights to attach to the scene: one ambient light and one point light.
     * 
     * @param {number} pointLightIntensity - Intensity of the point light.
     * @param {number} ambientLightIntensity - Intensity of the ambient light.
     */
    setupLights(pointLightIntensity, ambientLightIntensity){
        let cameraLight = new THREE.PointLight(0xffffff, pointLightIntensity);
        let ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
        //Attach the light to the camera
        this.camera.add(cameraLight);
        this.threeScene.add(ambientLight);
    }

    /**
     * It removes an object from the scene.
     * 
     * @param {THREE.Object3D} object - Object to remove from the scene.
     */
    remove(object) {
        this.threeScene.remove(object);
    }

    /**
     * It adds an object to the scene.
     * 
     * @param {THREE.Object3D} object - Object to be attached to the scene.
     */
    add(object) {
        this.threeScene.add(object);
    }

    /**
     * Helper that loads the model file into the scene.
     * 
     * @param {THREE.FileLoader} loader - Specific loader to parse the elements.
     * @param {String} filename - Route to the PLY file to be loaded.
     */
    load(loader, filename){
        let myScene = this;
        let autoZoom = this.autoZoom;
        loader.load(filename, function (geometry) {
            geometry.computeVertexNormals();
            //If the model has a color, we have to use it.
            let material;
            if (geometry.attributes.color !== undefined || geometry.hasColors){
                material = new THREE.MeshStandardMaterial( { shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
                myScene.setupLights(0.1, 2.0);
            }else{
                //Now we provide a default color.
                material = new THREE.MeshStandardMaterial( { color: Utils.getColor("material-standard"), shading: THREE.SmoothShading } );
                myScene.setupLights(0.6,0.4);
            }
            myScene.theObject = new THREE.Mesh( geometry, material );
            //Calculate the initial position in case the center is offset from origin
            if (myScene.theObject.geometry.boundingSphere === null) {
                myScene.theObject.geometry.computeBoundingSphere();
            }
            let centerOfObject = myScene.theObject.geometry.boundingSphere.center;
            myScene.theObject.position.sub(centerOfObject);
            myScene.add( myScene.theObject );
            myScene.autoZoom();
        });
    }

    /**
     * It helps zooming in or out the required amount to the object to be centered into the scene.
     */
    autoZoom(){
        let sphereRadius = this.theObject.geometry.boundingSphere.radius;
        const factor = 1.25;
        let angle = this.camera.fov / 2 * Math.PI/180;
        let distance = sphereRadius * factor / Math.tan(angle);
        this.camera.position.z = distance;
    }

    /**
     * Returns the target size that the spheres added should be. It is correlated to
     * the size of the object we are seeing.
     * 
     * @return {Number} Target size of the spheres (both annotation or measurement).
     */
    get radius(){
        return this.theObject.geometry.boundingSphere.radius * 0.007;
    }

    /**
     * Event listener wich updates the coordinates of the mouse whenever the mouse is moved.
     * The target range is [-1,1].
     */
    __attachUpdateMouseCoordinatesEventListener() {
        let mouse = this.mouse;
        let myScene = this;
        myScene.canvasNode.addEventListener('mousemove', function (event) {
            mouse.x = ( (event.clientX - myScene.canvasNode.offsetLeft - 1) / myScene.canvasNode.clientWidth )* 2 - 1;
            mouse.y = - (( event.clientY - myScene.canvasNode.offsetTop - 1) / myScene.canvasNode.clientHeight ) * 2 + 1;
        });
    }

    /**
     * Mades changes to the renderer and camera when the canvas is resized.
     */
    __attachResizeCanvasEventListener() {
        let myScene = this;
        window.addEventListener('resize', function () {
            myScene.renderer.setSize(myScene.canvasNode.clientWidth, myScene.canvasNode.clientHeight, false);
            myScene.camera.aspect = myScene.canvasNode.clientWidth / myScene.canvasNode.clientHeight;
            myScene.camera.updateProjectionMatrix();
        });
    }
}