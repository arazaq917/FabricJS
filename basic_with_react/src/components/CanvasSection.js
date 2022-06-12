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
  const zoomInCanvas = () => {
    props.zoomInCanvas();
  };
  const zoomOutCanvas = () => {
    props.zoomOutCanvas();
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
        <Button onClick={zoomInCanvas}>Zoom In</Button>
        <Button onClick={zoomOutCanvas}>Zoom Out</Button>
        <Button onClick={onChange}>Group</Button>

      </div>
      <div className="canvas">
        <canvas id="canvas"></canvas>
      </div>
    </div>
  );
};

export default CanvasSection;
