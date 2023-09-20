import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App"

var root = null;
function checkIfDocumentIsReady() {
    if(!document.getElementById("root")) {
        window.setTimeout(checkIfDocumentIsReady, 100);
    } else {
      renderReactApp();
    }
}
checkIfDocumentIsReady(); 

function renderReactApp() {
  root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
}