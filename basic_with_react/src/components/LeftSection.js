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
        <h4>Text</h4>
        <Button onClick={addText}>Add Text</Button>
        <Button onClick={addTextbox}>Add Textbox</Button>
        <h4>Image from URL</h4>
        <Button onClick={addImage}>Add Image</Button>
        <Button onClick={svgImage}>Add SVG</Button>
        <h4>Custom Image</h4>
        <input type="file" onChange={customImg} />
      </div>
    </div>
  );
};

export default LeftSection;
