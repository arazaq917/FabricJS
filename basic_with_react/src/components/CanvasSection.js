import React from "react";
import Button from "../UI/Button";
import "./CanvasSection.css";

const CanvasSection = (props) => {
  const clear = () => {
    clearHis()
    props.clear();
  };
  const clearHis = () => {
    props.clearHistory();
  };
  const deleteObj = () => {
    props.delete();
  };
  const saveCanvas = () => {
    props.save();
  };

  const addText = () =>{
    props.addText()
  }
  const onChange = () => {
    props.onChange();
  };
  return (
    <div className="canvasSection">
      <div className="header">
        <h2>Canvas Section</h2>
      </div>
      <div className="clear">
        <Button onClick={deleteObj}>Delete</Button>
        <Button onClick={clear}>Clear</Button>
        <Button onClick={saveCanvas}>Download</Button>
        <Button onClick={addText}>Add Text </Button>

      </div>
      <div className="canvas">
        <canvas id="canvas"></canvas>
      </div>
    </div>
  );
};

export default CanvasSection;
