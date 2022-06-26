import Canvas from "./components/Canvas";
import React from "react";
import Header from "./Layout/Header";
import MainPanel from "./components/MainPanal";

function App() {
  return(
  <>
    <div className="App">
      <div className="lf-container">
        <div className="lf-steps-container">
          <Header/>
          <MainPanel/>
        </div>
      </div>
    </div>
    {/*<Canvas />*/}
  </>
  )}

export default App;
