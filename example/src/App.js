import React, { useState, useEffect } from 'react';
import { ToolBox } from './Editor/ToolBox';
import { Editor } from './Editor/Editor';

function App() {
  let editor = null;
  useEffect(() => {
    editor = new Editor("editor-container");
  }, []);
  
  function settingsChanged() {
    if (editor.settingsChanged) {editor.settingsChanged()}
  }

  return (    
    <>
      <ToolBox settingsChanged={settingsChanged}/>
      <div id={"editor-container"}></div>
      <br/>
      <p>JUST SOME TEXT</p>
    </>
  );
}

export default App;
