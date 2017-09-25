import {Utils} from "./Utils.js";

/**
 * @fileoverview Holds the logic for importing and exporting the points.
 */

export class PointManager {
    /**
     * @constructor
     * @class Inits the buttons on the UI to manage the points.
     * @param {Scene} myScene - The scene we want to handle points.
     * @param {AnnotationTool} annotations - Reference to an annotation tool.
     * @param {MeasurementTool} measurements - Reference to a measurement tool.
     */
    constructor(myScene, annotations, measurements) {
        this.myScene = myScene;
        this.annotations = annotations;
        this.measurements = measurements;
        this.__initImportButton();
        this.__initExportButton();
    }

    /**
     * Inits the import button on the menu.
     */
    __initImportButton() {
        let instance = this;
        $( "#import-points").click(
            function () {
                $("#file").click();
            }
        ).button({
            icon: "ui-icon-arrowthickstop-1-n",
            text: false
        });
        $( "#file" ).change(
            function () {
                //It should only be one file.
                let file = this.files[0];
                let json = Utils.loadJSON(file,
                    function(event){
                        let text = event.target.result;
                        let json = JSON.parse(text);

                        //Warn when the file we are importing doesn't match the model.
                        let url = document.URL;
                        let documentFilename = url.substring(url.lastIndexOf('/') + 1);
                        let jsonFilename = json.filename;
                        if (jsonFilename !== documentFilename) {
                            $( "#not-same-model-warn").dialog({
                                title: "Warning!",
                            });
                        }

                        //Load annotations.
                        let annotations = json.annotations;
                        for (let annotation of annotations) {
                            let point = annotation.points[0];
                            let tag = annotation.tag;
                            instance.annotations.addPoint(point, tag);
                        }
                        //Load measurements.
                        let measurements = json.measurements;
                        for (let measurement of measurements) {
                            let point1 = measurement.points[0];
                            let point2 = measurement.points[1];
                            let tag = measurement.tag;
                            instance.measurements.addPoint(point1);
                            instance.measurements.addPoint(point2, tag);
                        }
                    }
                );
            }
        );
    }

    /**
     * Inits the export button on the menu.
     */
    __initExportButton() {
        let instance = this;
        $( "#export-points").click(
            function exportJSONPoints() {
                let url = document.URL;
                let documentFilename = url.substring(url.lastIndexOf('/') + 1);
                let annotations = instance.annotations.toJSON();
                let measurements = instance.measurements.toJSON();
                let json = Object.assign({"filename": documentFilename}, annotations, measurements);
                $.ajax({
                    url: '/_add_checksum_to_json',
                    type: "POST",
                    data: JSON.stringify(json),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: 
                        function(data){
                            let filename = "pointsExport.json";
                            Utils.saveTextAs(JSON.stringify(data), filename)
                        }
                });
            }
        ).button({
            icon: "ui-icon-arrowthickstop-1-s",
            text: false
        });
    }
}