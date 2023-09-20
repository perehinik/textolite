import { Editor } from "textolite";

var editor = null;
function checkIfDocumentIsReady() {
    if(!document.getElementById("editor-container")) {
        window.setTimeout(checkIfDocumentIsReady, 100);
    } else {
        editor = new Editor("editor-container");
    }
}
checkIfDocumentIsReady(); 
