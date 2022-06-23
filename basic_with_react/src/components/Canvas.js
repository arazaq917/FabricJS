import React, { useState, useEffect } from "react";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import CanvasSection from "./CanvasSection";
import { useDispatch, useSelector } from "react-redux";
import { canvasAction } from "../store/CanvasSlice";
import { fabric } from "fabric";
import "fabric-history";
import { act } from "@testing-library/react";

const Canvas = () => {
  let [canvas, setCanvas] = useState();
  const [text, setText] = useState("");
  const [svgColor, setSvgColor] = useState([]);
  const [objArr, setObjArr] = useState([]);
  let iLeft =0,  iTop = 0, tempCanvas , tempWidth, tempHeight;

  // const dispatch = useDispatch();
  // const canvas = useSelector((state) => state.canvas);
  useEffect(() => {
    let canvas = new fabric.Canvas('canvas', {
      width: 600,
      height: 600,
      backgroundColor: "#c6c7c5",
    });
    setCanvas(canvas);
    tempCanvas = canvas;
    
    canvas.renderAll();
    canvas.on({
      'object:moving' :movingObject,
      'selection:created':selectionCreated,
      'selection:updated':selectionUpdated,
      'object:moved' : movedObject,
      'object:scaling':objectScaling,
      'object:resizing':objectScaling
    }
  )
  }, []);

  // Canvas events
  const objectScaling = (e)=>{
    let tempObjs = tempCanvas._objects;
    let itex = tempObjs.find(f=>f.name === 'iText' && f.id === e.target.id);
    let itexH = tempObjs.find(f=>f.name === 'iTextH' && f.id === e.target.id);
    console.log(e.target.getScaledWidth())
    console.log('scaling',e.transform.ex);
    console.log(e);
    let tW = e.target.getScaledWidth();
    let tH = e.target.getScaledHeight();
    itex.top = ((e.target.getScaledHeight())+e.target.top)+4
    itex.left = e.target.left;
    itexH.left = e.target.left-40;
    itexH.top=  (e.target.top+(e.target.getScaledHeight()/2))+4;
    if(e.target.name === 'rect'){
  
      if(itex && itexH){
        itex.text = `${tW.toFixed(2)}`;
        itexH.text = `${tH.toFixed(2)}`;
        tempCanvas.renderAll();
      }
    }
  }
  const movingObject = (e)=>{
    console.log('objects moving');
    let actObj = e.target;
    let tempObjs = tempCanvas._objects;
    console.log(iLeft,iTop);
  
    let tObj = tempObjs.findIndex(f=>f.name === 'iText' && f.id === actObj.id);
    let tObjH = tempObjs.findIndex(f=>f.name === 'iTextH' && f.id === actObj.id);
    if(tObj>-1){
      tempObjs[tObj].top = ((e.target.getScaledHeight())+e.target.top)+4;
      tempObjs[tObj].left = e.target.left;
      tempObjs[tObjH].top = (e.target.top+(e.target.getScaledHeight()/2))+4;
      tempObjs[tObjH].left = e.target.left-40;


      //  let tempDiff = {left:actObj.left-iLeft, top:actObj.top-iTop};
  
      //  console.log(tempDiff)
      //  tempObjs[tObj].left = tempObjs[tObj].left+tempDiff.left;
      //  tempObjs[tObj].top = tempObjs[tObj].top+tempDiff.top;
      //  iLeft = actObj.left;
      //  iTop = actObj.top;
      //  tempCanvas.renderAll();
    }
  }
  const selectionCreated = (e)=>{
    console.log('selectionCreated');
    if(e.selected.length == 1){
      iLeft = e.selected[0].left;
      iTop = e.selected[0].top;
      tempWidth = e.selected[0].getScaledWidth();
      tempHeight = e.selected[0].getScaledHeight();
    }
    // console.log(iLeft,iTop);
  }
  const selectionUpdated = (e)=>{
    console.log('selection Updated');
    if(e.selected.length == 1){
      iLeft = e.selected[0].left;
      iTop = e.selected[0].top;
      tempWidth = e.selected[0].width;
      tempHeight = e.selected[0].height;
    }
  }
  const movedObject = ()=>{
    console.log('object moved');
  }
  // Canvas Function
  window.canvas = canvas;

  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = 'blue';
  fabric.Object.prototype.cornerStyle = 'circle';

  let color = "#000000";
  const clear = () => {
    addNewState();
    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage) {
        canvas.remove(obj);
      }
    });
  };

  const clearHistory = () => {
    clear();
    setObjArr([]);
    setSvgColor([]);
  };

  const addRect = () => {
    let w =100;
    let h = 150;
    let rect = new fabric.Rect({
      width: w,
      height: h,
      left: 200,
      top: 250,
      fill: "#A6BABA",
      borderColor: "red",
      name:'rect',
      strokeWidth: 15,
      stroke: "black",
      cornerColor: "red",
      // padding: 15,
      transparentCorners: false,
      id: Date().toString(),
    });
      rect.setControlsVisibility({
          mtr: false,
      });
      setObjArr([...objArr, rect]);
      canvas.add(rect);
      canvas.setActiveObject(rect);
      canvas.centerObject(rect);
      canvas.isDrawingMode = false;
      let txt = new fabric.IText(`${w}`, {
      fontFamily: 'Courier New',
      left:rect.left,
      top: ((rect.height)+rect.top)+4,
      name: 'iText',
      fontSize: 14,
      fill: '#000000',
      id:rect.id,
      objecttype:'text',
    
  });
    canvas.add(txt);
    let txtH = new fabric.IText(`${h}`, {
    fontFamily: 'Courier New',
    // left:rect.left-rect.width/2,
    left:rect.left-40,
    top:  (rect.top+(rect.height/2))+4,
    name: 'iTextH',
    fontSize: 14,
    fill: '#000000',
    id:rect.id,
    objecttype:'text',
    angle:-90
  
});
    canvas.add(txtH);
    canvas.discardActiveObject();
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const colorPicker = (c) => {
    color = c;
    canvas.freeDrawingBrush.color = color;
    const obj = canvas.getActiveObject();
    if (obj.type === "path") {
      canvas.freeDrawingBrush.color = color;
    } else {
      obj.set({ fill: color });
    }
    canvas.renderAll();
  };

  const deleteObject = () => {
    addNewState();
    let target = canvas.getActiveObject();
    let textObj = canvas._objects.find(f=>f.name === 'iText' && f.id === target.id);
    if(textObj){
      canvas.remove(textObj)
    }
    canvas.remove(target);
    canvas.requestRenderAll();
  };

  const saveCanvas = () => {
    const img = canvas.toDataURL();
    let link = document.createElement("a");
    console.log("link", link);
    link.download = "canvas.png";
    link.href = img;
    link.click();
    link.remove();
  };

  function redo() {
    canvas.redo();
  }
  function undo() {
    canvas.undo();
  }

  const addNewState = () => {
    let canvasObject = canvas.toJSON();
    undoStack.push(JSON.stringify(canvasObject));
  };

  let undoStack = [];
  const addText = ()=>{
   
    let actObj = canvas.getActiveObject();
    console.log('text ');
   
    if(actObj ){
      let cText = canvas._objects.findIndex(f=>f.name === 'iText' && f.id === actObj.id);
      if(cText == -1){
        let textVal = prompt('Add Text');
        if(textVal !==null && textVal !== ' ' && textVal.length !==0){
          let tVal = textVal;
          let tempLeft = actObj.getCenterPoint().x;
          let tempTop = actObj.getBoundingRect().top - 25;
          let text = new fabric.IText(tVal, {
            fontFamily: 'Courier New',
            left: tempLeft,
            top: tempTop,
            name: 'iText',
            fontSize: 14,
            fill: '#000000',
            id:actObj.id,
            objecttype:'text',
        });
        canvas.add(text);
        canvas.discardActiveObject();
        canvas.setActiveObject(actObj);
        canvas.renderAll();
        iLeft = actObj.left;
        iTop=actObj.top;
        console.log(iLeft,iTop);
        }
        else{
          alert('please type something and retry')
        }
      } 
    }
    else{
      alert('Please select the object first and try again');
    }
  }
  return (
    <>
      <div className="mainBody">
        <div>
          <LeftSection
            addRect={addRect}
          />
        </div>
        <div>
          <CanvasSection
            addText = {addText}
            clearHistory={clearHistory}
            clear={clear}
            delete={deleteObject}
            save={saveCanvas}
          />
        </div>
        <div>
          <RightSection
            color={colorPicker}
            text={text}
            arr={objArr}
            undo={undo}
            redo={redo}
            canvas={canvas}
          />
        </div>
      </div>
    </>
  );
};

export default Canvas;
