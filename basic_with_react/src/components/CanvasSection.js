import React from "react";
import Button from "../UI/Button";
import "./CanvasSection.css";

const CanvasSection = (props) => {
  const clear = () => {
    props.clear();
  };
  const clearHis = () => {
    props.clearHistory();
  };
  const deleteObj = () => {
    props.delete();
  };
  const savecanvas = () => {
    props.save();
  };
  const restore = () => {
    props.restore();
  };
  return (
    <div className="canvasSection">
      <div className="header">
        <h2>Canvas Section</h2>
      </div>
      <div className="clear">
        <Button onClick={deleteObj}>Delete</Button>
        <Button onClick={clear}>Clear</Button>
        <Button onClick={restore}>Restore</Button>
        <Button onClick={clearHis}>Clear Hostory</Button>
        <Button onClick={savecanvas}>Download</Button>

        {/* <button onClick={saveData}>SaveAsJSON</button> */}
      </div>
      <div className="canvas">
        <canvas id="canvas"></canvas>
      </div>
    </div>
  );
};

export default CanvasSection;
