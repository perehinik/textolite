import React, { useState, useEffect } from 'react';
import { ToolBox } from './Editor/ToolBox';
import { Editor } from './Editor/Editor';

function App() {
  useEffect(() => {
    const editor = new Editor("editor-container");
  }, []);
  
  return (    
    <>
      <ToolBox />
      <div id={"editor-container"}></div>
    </>
  );
}

export default App;
