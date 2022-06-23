import React from "react";
import Button from "../UI/Button";
import "./LeftSection.css";

const LeftSection = (props) => {
  const addRect = () => {
    props.addRect();
  };

  return (
    <div className="left">
      <div className="header">
        <h2>Left Section</h2>
      </div>
      <div className="container">
        <h4>Shapes</h4>
        <Button onClick={addRect}>Add Rect</Button>
        <br/>
        {/* <Button onClick={addText}>Add Text</Button> */}
      </div>
    </div>
  );
};

export default LeftSection;
