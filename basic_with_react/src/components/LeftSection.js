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
      <div className="container" style={{margin:'0px 60px'}}>
        <h4>Shapes</h4>
          <div style={{display:'flex',flexDirection:'column'}}>
              <Button onClick={addRect}>Add Windows</Button>
              <Button onClick={props.addTopWindow}>Top Window</Button>
          </div>
      </div>
    </div>
  );
};

export default LeftSection;
