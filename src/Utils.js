/**
 * @fileoverview Some utilities made a class.
 */

/**
 * @class
 */
export class Utils {
    /**
     * Changes the cursor style within a node of the document.
     * 
     * @static
     * @param {Node} canvasNode - The document node which cursor is about to be changed.
     * @param {String} aStyle - The style we append to the cursor.
     */
    static changeCursor (canvasNode, aStyle){
        canvasNode.style.cursor = aStyle;
    }

    /**
     * Returns a color of the defined ones. If the ref doesn't exist, it
     * returns a white one.
     * 
     * @static
     * @param {String} ref - The reference to the color we want.
     * @return {THREE.Color} The color we want.
     */
    static getColor(ref){
        //Configuration constants
        const defaultMaterialColor = new THREE.Color(0x909090);
        const annotationStandard = new THREE.Color(0xff0000);
        const annotationHighlighted = new THREE.Color(0x00ff00);
        const defaultLineColor = new THREE.Color(0x0000ff);
        const measurementStandard = new THREE.Color(0xff0000);
        const measurementHighlighted = new THREE.Color(0x00ff00);

        switch (ref) {
            case "annotation-standard":
                return annotationStandard;
            case "annotation-highlighted":
                return annotationHighlighted;
            case "material-standard":
                return defaultMaterialColor;
            case "measurement-standard":
                return measurementStandard;
            case "measurement-highlighted":
                return measurementHighlighted;
            default:
                console.warn("Warning, no color defined for " + ref);
                //Default white
                return new THREE.Color();
        }
    }

    /**
     * Pops up a dialog for saving a file with the specified content.
     * 
     * @param {String} plainText - The content the file should have in plain text.
     * @param {String} filename -  The name the file should have.
     */
    static saveTextAs(plainText, filename) {
        let link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(plainText);
        link.download = filename;

        if (document.createEvent) {
            let event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            link.dispatchEvent(event);
        }
        else {
            link.click();
        }
    }

    static loadJSON(file, callback) {
        let reader = new FileReader();
        reader.onloadend = callback;
        reader.readAsText(file);
    }
}