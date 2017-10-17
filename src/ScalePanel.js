/**
 * @fileoverview A tool to manage the scale of the model.
 */

export class ScalePanel {
    /**
     * @constructor
     * @class It helps to know the scale of the model.
     * @param {Scene} myScene - The scene which we want to manage its scale.
     */
    constructor(myScene) {
        this.myScene = myScene;
        //Parameters for the gui.
        this.parameters = 
            {
                "Model units" : {mm:1, cm:10, in:25.4},
                "Grid units" : {mm:1, cm:10, in:25.4},
                "Grid Helper" : false,
            };
        this.gui = new dat.GUI();
        this.__addGUI();
    }

    /**
     * It refreshes the grid helper.
     */
    refreshGridHelper(){
        if (this.myScene.threeScene.getObjectByName("MyGridHelper") != undefined){
            this.toggleGridHelper(false);
            this.toggleGridHelper(true);
        }
    }

    /**
     * It shows or hides the grid helper.
     */
    toggleGridHelper(cb, instance) {
        let that;
        if (instance) {
            that = instance;
        } else {
            that = this
        }
        if (cb){
            let a = new THREE.Mesh();
            that.myScene.theObject.geometry.computeBoundingBox();
            const boundingBox = that.myScene.theObject.geometry.boundingBox;
            const difference = boundingBox.max.clone().sub(boundingBox.min);
            let maxModelSizeInWorldUnits = Math.ceil(Math.max(difference.x, difference.z));

            const modelSizeFactor = that.getModelSizeFactor();
            const gridSizeFactor = that.getGridSizeFactor();
            const numberDivisions = Math.ceil(maxModelSizeInWorldUnits * modelSizeFactor / gridSizeFactor);
            const size = numberDivisions*gridSizeFactor/modelSizeFactor;

            let gridHelper = new THREE.GridHelper(size, numberDivisions);
            gridHelper.name = "MyGridHelper";
            const middle = difference.clone().divideScalar(2);
            gridHelper.position.y -= middle.y;
            gridHelper.position.y *= 1.001;
            that.myScene.add(gridHelper);
        }else{
            that.myScene.remove(that.myScene.threeScene.getObjectByName("MyGridHelper"));
        }
    }

    /**
     * Getter for model size factor.
     * 
     * @return {number} The value of mm of the actual unit of scale.
     */
    getModelSizeFactor(){
        return this.gui.__folders.Units.__controllers[0].__select.value
    }

    /**
     * Getter for grid size factor.
     * 
     * @return {number} The value in mm that the grid should have between gaps.
     */
    getGridSizeFactor(){
        return this.gui.__folders.Units.__controllers[1].__select.value
    }

    /**
     * Adds the dat.GUI helper to the scene.
     */
    __addGUI(){
        let unitsFolder = this.gui.addFolder('Units');
        let modelUnits = unitsFolder.add(this.parameters, "Model units", this.parameters["Model units"]);
        let gridUnits = unitsFolder.add(this.parameters, "Grid units", this.parameters["Grid units"]);
        let that = this;
        unitsFolder.add(this.parameters, "Grid Helper").onFinishChange(
            function(event) {
                (function(event, instance) {
                    instance.toggleGridHelper(event, instance);
                })(event, that);
            }
        );
        //Set default units.
        let modelUnitsDefault = this.parameters["Model units"].mm;
        let gridUnitsDefault = this.parameters["Grid units"].mm;
        modelUnits.setValue(modelUnitsDefault);
        gridUnits.setValue(gridUnitsDefault);
        //We add the refreshGridHelper to make it happen on scale changes.
        modelUnits.onFinishChange(this.refreshGridHelper);
        gridUnits.onFinishChange(this.refreshGridHelper);
    }
}




