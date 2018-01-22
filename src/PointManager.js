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
        this.__initSaveButton();
        this.__initLoadButton();
        this.__initCancelButton();
        this.__initPointsLoad();
        this.__initResetButton();
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
                        var corrupt =  false;
                        let text = event.target.result;
                        let json = JSON.parse(text);

                        let json_check = JSON.parse(JSON.stringify(json));
                        delete json_check['checksum'];
                        delete json_check['timestamp'];

                        $.ajax({
                            url: '/_add_checksum_to_json',
                            type: "POST",
                            data: JSON.stringify(json_check),
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            success: 
                                function(data){
                                    if(json['checksum'] == data['checksum']){
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
                                            instance.measurements.addPoint(point1, tag);
                                            instance.measurements.addPoint(point2, tag);
                                        }

                                    }else{
                                        $.ajax({
                                            url: '/get_user_rol',
                                            type: "POST",
                                            data: JSON.stringify(data),
                                            dataType: "json",
                                            contentType: "application/json; charset=utf-8",
                                            success: 
                                                function(data){
                                                    if(data['rol'] == 'Profesor'){
                                                        $( "#copy-warn").dialog({
                                                            title: "Warning!",
                                                        });
                                                    }else{
                                                        $( "#copy-warn").dialog({
                                                            title: "Warning!",
                                                        });
                                                    }
                                                }
                                        });
                                    }

                                    $("#file").val('');
                                }
                        });
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
                $.ajax({
                    url: '/get_user_rol',
                    type: "POST",
                    data: JSON.stringify({}),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: 
                        function(data){
                            let url = document.URL;
                            let documentFilename = url.substring(url.lastIndexOf('/') + 1);
                            let annotations = instance.annotations.toJSON();
                            let measurements = instance.measurements.toJSON();
                            let rol = data['rol'];

                            $.ajax({
                                url: '/get_user_email',
                                type: "POST",
                                data: JSON.stringify({}),
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",
                                success: 
                                    function(data){
                                        let email = data["email"]

                                        if(rol != "Profesor"){
                                            for (let annotation of annotations["annotations"]) {
                                                let prevAnnotationTag = annotation.tag;
                                                annotation.tag = "@" + email.split("@")[0] + "-" + prevAnnotationTag;
                                            }
            
                                            for (let measurement of measurements["measurements"]) {
                                                let prevMeasurementTag = measurement.tag;
                                                measurement.tag = "@" + email.split("@")[0] + "-" + prevMeasurementTag;
                                            }
                                        }

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
                            });
                        }
                });
            }
        ).button({
            icon: "ui-icon-arrowthickstop-1-s",
            text: false
        });
    }

    /**
     * Inits the save button on the menu.
     */
    __initSaveButton() {
        let instance = this;
        $( "#save-points").click(
            function exportJSONPoints() {
                let url = document.URL;
                let documentFilename = url.substring(url.lastIndexOf('/') + 1);
                let annotations = instance.annotations.toJSON();
                let measurements = instance.measurements.toJSON();
                let json = Object.assign({"filename": documentFilename}, annotations, measurements);
                $.ajax({
                    url: '/_save_json_in_my_folder',
                    type: "POST",
                    data:  JSON.stringify({'json' : JSON.stringify(json),'filename': document.getElementById("nombre").innerHTML, 'exercise' : document.getElementById("ejercicio").innerHTML}),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: 
                        function (data) {
                        }
                });
            }
        ).button({
            icon: "ui-icon-document",
            text: false
        });
    }

    /**
     * Inits the load button on the menu.
     */
    __initLoadButton() {
        let instance = this;
        $( "#load-points").click(
            function () {
                $.ajax({
                    url: '/_load_json_in_visor',
                    type: "POST",
                    data: JSON.stringify({'exercise': document.getElementById("ejercicio").innerHTML, 'filename': document.getElementById("nombre").innerHTML}),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: 
                        function (data) {
                            
                            //Warn when the file we are importing doesn't match the model.
                            let url = document.URL;
                            let documentFilename = url.substring(url.lastIndexOf('/') + 1);
                            let jsonFilename = data["filename"];
                            if (jsonFilename !== documentFilename) {
                                $( "#not-same-model-warn").dialog({
                                    title: "Warning!",
                                });
                            }

                            //Load annotations.
                            let annotations = data["annotations"];
                            for (let annotation of annotations) {
                                let point = annotation.points[0];
                                let tag = annotation.tag;
                                instance.annotations.addPoint(point, tag);
                            }
                            //Load measurements.
                            let measurements = data["measurements"];
                            for (let measurement of measurements) {
                                let point1 = measurement.points[0];
                                let point2 = measurement.points[1];
                                let tag = measurement.tag;
                                instance.measurements.addPoint(point1, tag);
                                instance.measurements.addPoint(point2, tag);
                            }
                        }
                });
            }
        ).button({
            icon: "ui-icon-arrowthickstop-1-n",
            text: false
        });
    }


    /**
     * Inits the cancel button on the menu.
     */
    __initCancelButton() {
        let instance = this;
        $( "#cancel-exercise").click(
            function exportJSONPoints() {
                let url = document.URL;
                let documentFilename = url.substring(url.lastIndexOf('/') + 1);
                let annotations = instance.annotations.toJSON();
                let measurements = instance.measurements.toJSON();
                let json = Object.assign({"filename": documentFilename}, annotations, measurements);
                $.ajax({
                    url: '/_cancel_started_exercise',
                    type: "POST",
                    data: JSON.stringify({'json': json, 'exercise': document.getElementById("ejercicio").innerHTML, 'filename': document.getElementById("nombre").innerHTML}),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: 
                        function (data) {
                            if(data['changed']){
                                let dialog = $( "#confirm-save-tag" );
                                dialog.dialog({
                                    title: "¿Desea guardar los cambios?",
                                    modal: true,
                                    buttons: {
                                        "Sí": function(){
                                            $("#save-points").click();
                                            $("#redirect-to-list").click();
                                            $(this).dialog("close");
                                        },
                                        "No": function() {
                                            $.ajax({
                                                url: '/_delete',
                                                type: "POST",
                                                data: JSON.stringify({'filename' : document.getElementById("nombre").innerHTML, 'exercise': data["exercise"]}),
                                                dataType: "json",
                                                contentType: "application/json; charset=utf-8",
                                                success: 
                                                    function(data){
                                                    }
                                            });
                                            $("#redirect-to-list").click();
                                            $(this).dialog("close");
                                        },
                                        "Cancelar": function() {
                                            $(this).dialog("close");
                                        }
                                    }
                                        });
                            }else{
                                $("#redirect-to-list").click();
                            }
                        }
                });
            }
        ).button({
            icon: "ui-icon-close",
            text: false
        });
    }

    /**
     * Reset the exercise to the begining
     */
    __initResetButton(){
        let instance = this;
        $(document).ready(function(){
            $("#reset-anotations-mesaurements").click(
                function resetExercise() {

                    //Removing Annotations
                    var i;
                    for (i = instance.annotations.elements.length - 1; i >= 0 ; --i){
                        instance.annotations.removeParticle(instance.annotations.elements[i]);
                    }

                    //Removing Measurements
                    var j;
                    for (j = instance.measurements.elements.length - 1; j >= 0 ; --j){
                        instance.measurements.removeParticle(instance.measurements.elements[j]);
                    }

                    //Loading starting points
                    $("#load-points").click();
                }
            ).button({
                icon: "ui-icon-refresh",
                text: false
            });
        })
    }

    /**
     * Loads points automatically on page load
     */
    __initPointsLoad(){
        $(document).ready(function(){
            $("#load-points").click();
        })
    }
}