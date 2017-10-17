import {Scene} from "./Scene.js";
import {AnnotationTool} from "./AnnotationTool.js";
import {MeasurementTool} from "./MeasurementTool.js";
import {ScalePanel} from "./ScalePanel.js";
import {PointManager} from "./PointManager.js";

/**
 * @fileoverview Principal file where all happens.
 */

/**
 * Holds the reference to the actual scene.
 */
let myScene

/**
 * Holds the reference to the controls we are using.
 */
let controls;

/**
 * It holds the reference to the measurements tool.
 */
let measurements;

/**
 * Holds the reference to the scale gui helper.
 */
let scalePanel;

/**
 * Holds the reference to the annotations tool.
 */
let annotations;

/**
 * Point manager.
 */
let pointManager;

init();
animate();

/**
 * Inits the scene.
 */
function init() {
	myScene = new Scene("threejs_canvas", 0.001, 1000000);

	//File route
	let url = document.URL;
	let filename = '../static/uploads/' + url.substring(url.lastIndexOf('/') + 1);
	let extension = filename.substring(filename.lastIndexOf(".") + 1);
	switch (extension.toLowerCase()) {
		case "ply":
			myScene.load(new THREE.PLYLoader(), filename);
			break;
		case "stl":
			myScene.load(new THREE.STLLoader(), filename);
			break;
		default:
			console.log("Unsupported file type");
	}

	annotations = new AnnotationTool(myScene);
	measurements = new MeasurementTool(myScene);

	pointManager = new PointManager(myScene, annotations, measurements);

	//Add right panel
	scalePanel = new ScalePanel(myScene);

	controls = new THREE.OrbitControls(myScene.camera, myScene.renderer.domElement);
}

/**
 * Determines actions to do every frame.
 */
function animate() {
	requestAnimationFrame(animate);
	myScene.renderer.render(myScene.threeScene, myScene.camera);
}