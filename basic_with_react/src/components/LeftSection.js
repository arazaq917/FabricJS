import React from "react";
import Button from "../UI/Button";
import "./LeftSection.css";

const LeftSection = (props) => {
  const addCir = () => {
    props.addCircle();
  };
  const addRect = () => {
    props.addRect();
  };
  const addPoly = () => {
    props.addPoly();
  };
  const addLine = () => {
    props.addLine();
  };
  const drawing = () => {
    props.draw("drawing");
  };

  const addText = () => {
    props.addTxt();
  };
  const addTextbox = () => {
    props.addTxtbox();
  };
  const addImage = () => {
    props.image();
  };
  const customImg = (img) => {
    props.customImg(img);
  };

  const svgImage = () => {
    props.svg();
  };
  return (
    <div className="left">
      <div className="header">
        <h2>Left Section</h2>
      </div>
      <div className="container">
        <h4>Draw</h4>
        <Button onClick={drawing}>Drawing</Button>
        <h4>Shapes</h4>
        <Button onClick={addCir}>Add Circle</Button>
        <Button onClick={addRect}>Add Rect</Button>
        <Button onClick={addPoly}>Add Polygon</Button>
        <Button onClick={addLine}>Add Line</Button>
        <br/>
        {/* <Button onClick={addText}>Add Text</Button> */}
        <h4>Load Image</h4>
        <input type="file" onChange={customImg} accept="image/*" />
      </div>
    </div>
  );
};

export default LeftSection;
