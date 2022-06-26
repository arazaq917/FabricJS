import React, {useState} from "react";
import Header from "../Layout/Header";
import './MainPanal.css'
import LeftSection from "./LeftSection";
import ActivePanel from "./ActivePanel";


const MainPanel =()=> {
    const [activePanel, setActivePanel] = useState(false)
    const activePanelHandler = (active)=>{
        console.log("Active Panel Clicked")
        setActivePanel(active)
    }
   return (
       <>
            <div style={{display:"block"}}>
                <Header/>
                <div className="lf-main-section d-flex responsiveMood m-t-100">
                    <div className="lf-editor-tool-section bg-white">
                        <div className="lf-editor-tool-container d-flex">
                            <LeftSection active={activePanelHandler}/>
                            <div className="lf-sub-panel lf-my-15 position-relative">
                                {activePanel&&
                                    <ActivePanel name={"Type"}/>
                                }
                            </div>
                        </div>
                    </div>
                    {/*<div className="d-flex flex-grow-1 lf-right-sub-section">*/}
                    {/*    <div*/}
                    {/*        id={"parent-Div"}*/}
                    {/*        className="lf-canvas-container col mx-0 px-0  h-100 d-flex flex-column flex-grow-1 overflow-auto position-relative"*/}
                    {/*        style={{background: "#F9F9F9"}}*/}
                    {/*    >*/}

                    {/*        /!*<div className=" bg-light m-auto canvas-area"*!/*/}
                    {/*        /!*     style={{border: this.state.border, boxShadow: this.state.boxShadow}}>*!/*/}
                    {/*        /!*    <Canvas/>*!/*/}
                    {/*        /!*</div>*!/*/}
                    {/*    </div>*/}

                    {/*</div>*/}
                </div>
            </div>

            </>
        );

    }

export default MainPanel;
