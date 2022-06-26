import React from "react";
import Button from "../UI/Button";
import "./MainPanal.css"
import "./LeftSection.css";

const LeftSection = (props) => {
  const addRect = () => {
      props.active(true)
      console.log("Clicked")
    // props.addRect();
  };

    return (

        <div className="lf-left-sub-section">
            <div className="lf-editor-options-btn-panel">
                <div className="as-type" onClick={addRect}>
                    Type
                </div>
                <div className="as-type">
                    Glass
                </div>
                <div className="as-type">
                    Grills
                </div>
                <div className="as-type">
                    Colors
                </div>
            </div>

        </div>
    );
  // return (
    // <div className="left">
    //   <div className="header">
    //     <h2>Left Section</h2>
    //   </div>
    //   <div className="container">
    //     <h4>Shapes</h4>
    //     <Button onClick={addRect}>Add Rect</Button>
    //   </div>
    // </div>

  // );
};

export default LeftSection;
