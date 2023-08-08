import React, { useState, useEffect } from 'react';
import { Editor } from 'textolite';

function App() {
  let editor = null;
  useEffect(() => {
    editor = new Editor("editor-container");
  }, []);

  return (    
    <>
      <div id={"editor-container"}></div>
      <br/>
      <p>JUST SOME TEXT</p>
    </>
  );
}

export default App;
