import React, { useState } from "react";
import Button from "../UI/Button";
import ToggleGroup from "./randomCode";
import "./RightSection.css";

const RightSection = (props) => {
  const types = ["sepia", "brownie", "vintage"];
  const [active, setActive] = useState(types[0]);
  const colorPicker = (e) => {
    props.color(e.target.value);
  };

  const undoCanvas = () => {
    props.undo();
  };
  const redoCanvas = () => {
    props.redo();
  };

  return (
    <div className="right">
      <div className="header">
        <h2>RightSection</h2>
      </div>
      <div className="container">
        <span>Color: </span>
        <input type="color" onChange={colorPicker} />
        <br />
        <br />
        {props.arr[0] && (
          <div>
            <Button onClick={undoCanvas}>Undo</Button>
            <Button onClick={redoCanvas}>Redo</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSection;
