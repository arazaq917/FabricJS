import React from "react";
import Button from "../UI/Button";
import "./RightSection.css";

const RightSection = (props) => {
  const colorPicker = (e) => {
    props.color(e.target.value);
  };

  const newText = (txt) => {
    props.newTxt(txt.target.value);
  };

  const textBold = () => {
    props.txtProp("bold");
  };
  const textUnder = () => {
    props.txtProp("underline");
  };
  const textItalic = () => {
    props.txtProp("italic");
  };

  const svgColorHandler = (e) => {
    props.svgFiller(e);
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

  const applyFilter = (e) => {
    if (e.target.checked) {
      props.filter();
    }
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
        <label>Filter: </label>
        <input type="checkbox" onChange={applyFilter} />
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
            <Button onClick={textBold}>B</Button>
            <Button onClick={textUnder}>U</Button>
            <Button onClick={textItalic}>I</Button>
            <br />
            <br />
            <span>Change Text</span>
            <input type="text" value={props.text} onChange={newText} />
          </div>
        )}
        {props.svgColor && props.arr[0] && (
          <div>
            {props.svgColor.map((c, index) => (
              <div key={index}>
                <br />
                <br />
                <span style={{ color: c.color }}>Color: </span>
                <input
                  type="color"
                  id={c.id}
                  value={c.color}
                  onChange={svgColorHandler}
                />
              </div>
            ))}
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
              {`${props.arr[index].type} ' ' ${props.arr[index].id} `}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSection;
