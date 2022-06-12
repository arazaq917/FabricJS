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

  const newText = (txt) => {
    props.newTxt(txt.target.value);
  };
  const showHistory = (id) => {
    props.loadObj(id);
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
        {props.text && (
          <div>
            <br />
            <br />
            <span>Change Text</span>
            <input type="text" value={props.text} onChange={newText} />
          </div>
        )}
        {props.arr.map((c, index) => (
          <div key={index}>
            <br />
            <br />
            <div
              style={{ cursor: "pointer" }}
              onClick={() => showHistory(props.arr[index].id)}
            >
              {`${props.arr[index].type}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSection;
