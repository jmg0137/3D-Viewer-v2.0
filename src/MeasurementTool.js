import {AbstractTool} from "./AbstractTool.js";
import {Utils} from "./Utils.js";
import {MeasurementElement} from "./MeasurementElement.js";

/**
 * @fileoverview A tool to manage the measurements (adding them, removing them, etc.)
 */

export class MeasurementTool extends AbstractTool {
    /**
     * @constructor
     * @class Just an implementation of AbstractTool that manages measurements.
     * @param {Scene} myScene - Reference to the scene we want to attach measurements to.
     */
    constructor(myScene) {
        super(myScene);
    }

    /**
     * Lights up or down a measurement in the model and on the lateral menu.
     */
    __selectParticleEventListener() {
        let instance = this;
        this.myScene.canvasNode.addEventListener('mousedown', function (){
            instance.myScene.raycaster.setFromCamera(instance.myScene.mouse, instance.myScene.camera);
            let threeObjects = [];
            instance.elements.forEach( function(measurement) {
                threeObjects.push(...measurement.threeObjects);
            });
            let intersected = instance.myScene.raycaster.intersectObjects(threeObjects,false);
            if (intersected.length > 0){
                let selectingObject = intersected[0].object;
                let line = selectingObject.parent;
                for (let measurement of instance.elements) {
                    if (line === measurement.line.threeObject) {
                        measurement.toggleColor();
                        break;
                    }
                }
                let uuid = line.uuid;
                //If it is normal, highlight it
                $("#measurement-list li[uuid='" + uuid + "']").toggleClass("ui-selected");
            }
        });
    }

    /**
     * Waits for a mousedown to see if it can add an element of the measurement.
     */
    __addParticleDisposableEvent(event) {
        this.myScene.raycaster.setFromCamera(this.myScene.mouse, this.myScene.camera);
        let intersected = this.myScene.raycaster.intersectObject(this.myScene.theObject,false);
        if (intersected.length > 0){
            let point = intersected[0].point;
            this.addPoint(point);

            let lastElement = this.elements.slice(-1).pop();
            if (lastElement.isComplete()) {
                Utils.changeCursor(this.myScene.canvasNode, "");
                event.target.removeEventListener(event.type, this.__addParticleDisposableEvent);
            }
        }
    }

    /**
     * Adds a point that is part of a measurement. When the second point is added,
     * a line is automatically attached.
     * @param {THREE.Vector3} point - The point where the measure will start or end.
     * @param {String} tag - The tag that the measurement should have.
     */
    addPoint(point, tag) {
        let lastElement = this.elements.slice(-1).pop();
        let measurement;
        if (!lastElement || lastElement.isComplete()) {
            if(tag != undefined){
                if(!tag.includes("@")){
                    measurement = new MeasurementElement(this.myScene, Utils.getColor("student-standard"), Utils.getColor("student-highlighted"));
                } else {
                    measurement = new MeasurementElement(this.myScene, Utils.getColor("student-standard"), Utils.getColor("student-highlighted"));
                }
            } else {
                measurement = new MeasurementElement(this.myScene, Utils.getColor("measurement-standard"), Utils.getColor("measurement-highlighted"));
            }
            this.elements.push(measurement);
            lastElement = this.elements.slice(-1).pop();
        }
        lastElement.add(point);

        if (lastElement.isComplete()) {
            let pointA = lastElement.sphere1.threeObject.position;
            let pointB = lastElement.sphere2.threeObject.position;
            let diff = pointA.clone().sub(pointB).length().toFixed(4);
            let newLi = $('<li uuid="' + lastElement.line.threeObject.uuid + '" tag="' + tag + '" distance="' + diff + '">' + tag + ' ' + diff + '</li>');
            $( "#measurement-list" ).append(newLi)
        }
    }

    /**
     * Removes the first measurement that the mouse touches.
     */
    __removeParticleDisposableEvent(event) {
        this.myScene.raycaster.setFromCamera(this.myScene.mouse, this.myScene.camera);
        let threeObjects = [];
        this.elements.forEach( function(measurement) {
            threeObjects.push(...measurement.threeObjects);
        });
        let intersected = this.myScene.raycaster.intersectObjects(threeObjects,false);
        if (intersected.length > 0){
            //Let cursor style as default.
            Utils.changeCursor(this.myScene.canvasNode, "");
            event.target.removeEventListener(event.type, this.__removeParticleDisposableEvent);
            let deletingLine = intersected[0].object.parent;
            this.__removeElement(deletingLine);
        }
    }

    /**
     * Remove all of the particles that a measurement has.
     */
    removeParticle(deletingMeasurement){
        let removingIndex = this.elements.indexOf(deletingMeasurement);
        this.elements.splice(removingIndex, 1);
        $("#measurement-list li[uuid='" + deletingMeasurement.mainParticle.uuid + "']")[0].remove();
        deletingMeasurement.clear();
    }

    /**
     * Inits the unselect button.
     * It unselects all of the selected measurements.
     */
    __initUnselectButton() {
        let instance = this;
        $( "#unselect-measurement-button" ).click(
            function(){
                $( "#measurement-list .ui-selected" ).each(function(){
                    //Remove selected attribute from UI.
                    $(this).removeClass("ui-selected");
                    //Toggle measurement color
                    let uuid = $(this).context.attributes["uuid"].value;
                    instance.toggleColor(uuid);
                });
            }
        ).button({
            icon: "ui-icon-flag",
            text: false
        });
    }

    /**
     * Inits the add button.
     */
    __initAddButton() {
        let instance = this;
        $( "#add-measurement-button" ).click(
            function() {
                instance.__addParticleEventListener();
            }
        ).button({
            icon: "ui-icon-plus",
            text: false
        });
    }

    /**
     * Inits the remove button.
     * This button can either:
     * *Remove the selected measurements
     * *If no one is selected, the next selected one will be removed.
     */
    __initRemoveButton() {
        let instance = this;
        $( "#remove-measurement-button").click(
            function(){
                let selected = $( "#measurement-list .ui-selected");
                if (selected.length === 0){
                    $( "#removing-warn").dialog({
                        title: "Info"
                    });
                    instance.__removeParticleEventListener();
                }else{
                    selected.each( function(index, element) {
                        let uuid = element.attributes["uuid"].value;
                        for (let measurement of instance.elements) {
                            if (measurement.mainParticle.uuid === uuid) {
                                instance.removeParticle(measurement);
                                break;
                            }
                        }
                    });
                }
            }
        ).button({
            icon: "ui-icon-trash",
            text: false
        });
    }

    /**
     * Inits the edit button.
     */
    __initEditButton() {
        let instance = this;
        $("#edit-measurement-button").click(
            function(){
                //If more than one measurement selected or none of them, warn.
                let selected = $( "#measurement-list .ui-selected");
                if (selected.length === 0 || selected.length > 1){
                    $( "#select-one-warn").dialog({
                        title: "Warning!"
                    });
                }else{
                    selected = selected[0];
                    let uuid = selected.attributes.uuid.value;
                    let dialog = $( "#tag" );
                    dialog.dialog({
                        title: "Editing...",
                        modal: true,
                        open: function(){
                            $("#tag-content").val(selected.attributes.tag.value).on(
                                "keypress",
                                function(e) {
                                    switch(e.keyCode) {
                                        case 13:
                                            $('.ui-button:contains("Save")').click();
                                        break;
                                        case 27:
                                            $('.ui-button:contains("Close")').click();
                                        break;
                                    }
                                }
                            );
                        },
                        buttons: {
                            "Save": function(){
                                let editingLi = $("#measurement-list li[uuid='" + uuid + "']")[0];
                                let finalTagValue = $("#tag-content")[0].value;
                                let expreg = new RegExp("^[a-zA-Z0-9\\-\\_\\s]*$");
                                if(expreg.test(finalTagValue)){
                                    editingLi.attributes.tag.value = finalTagValue;
                                    let distance = editingLi.attributes.distance.value;
                                    editingLi.textContent = finalTagValue + " " + distance;
                                    instance.__changeTagValue(uuid, finalTagValue);
                                    document.getElementById("tag-content").style.backgroundColor = "#FFFFFF"
                                    $(this).dialog("close");
                                }else{
                                    document.getElementById("tag-content").style.backgroundColor = "#ff3333"
                                }
                            },
                            Cancel: function() {
                                document.getElementById("tag-content").style.backgroundColor = "#FFFFFF"
                                $(this).dialog("close");
                            }
                        }
                    });
                }
            }
        ).button({
            icon: "ui-icon-pencil",
            text: false
        });
    }

    /**
     * Inits the measurements menu.
     */
    __initParticleMenu() {
        let instance = this;
        $( "#measurement-list" ).selectable({	
                //highlight
            selecting: function(event, ui){
                instance.toggleColor(ui.selecting.attributes["uuid"].value);
            },	//unhighlight
            unselecting: function(event, ui){
                instance.toggleColor(ui.unselecting.attributes["uuid"].value);
            }
	    });
    }

    /**
     * Exports the measurements to JSON.
     * @return {Object} An object containing the measurements.
     */
    toJSON() {
        let measurementList = [];
        for (let measurement of this.elements) {
            let temp = {};
            let line = measurement.line.threeObject,
                pointA = measurement.sphere1.threeObject,
                pointB = measurement.sphere2.threeObject;
            temp["tag"] = line.userData;
            temp["points"] = [pointA.position, pointB.position];
            measurementList.push(temp);
        }
        return {measurements: measurementList};
    }

    /**
     * Changes the color of the measurement with the designated uuid.
     * @param {string} uuid -  The identifier of the measurement we want to toggle color to.
     */
    toggleColor(uuid){
        let line = this.myScene.threeScene.getObjectByProperty("uuid", uuid);
        for (let measurement of this.elements) {
            if (measurement.line.threeObject === line) {
                measurement.toggleColor();
                break;
            }
        }
    }
}