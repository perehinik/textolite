import React, { useEffect } from 'react';
import { Editor } from 'textolite';

function App() {
  let editor = null;
  useEffect(() => {
    editor = new Editor("editor-container");
  }, []);

  return (    
    <div style={{display: "flex", justifyContent: "center", paddingTop: "30px"}}>
      <div id={"editor-container"} style={{width: "90%"}}></div>
    </div>
  );
}

export default App;
