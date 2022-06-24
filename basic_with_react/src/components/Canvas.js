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
    tempCanvas.setZoom(1)
    initCenteringGuidelines(tempCanvas);
    initAligningGuidelines(tempCanvas);
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

  const initCenteringGuidelines = (canvas) => {

    var canvasWidth = canvas.getWidth(),
        canvasHeight = canvas.getHeight(),
        canvasWidthCenter = canvasWidth / 2,
        canvasHeightCenter = canvasHeight / 2,
        canvasWidthCenterMap = { },
        canvasHeightCenterMap = { },
        centerLineMargin = 4,
        centerLineColor = 'rgba(255,0,241,0.5)',
        centerLineWidth = 1,
        ctx = canvas.getSelectionContext(),
        viewportTransform;

    for (var i = canvasWidthCenter - centerLineMargin, len = canvasWidthCenter + centerLineMargin; i <= len; i++) {
      canvasWidthCenterMap[Math.round(i)] = true;
    }
    for (var i = canvasHeightCenter - centerLineMargin, len = canvasHeightCenter + centerLineMargin; i <= len; i++) {
      canvasHeightCenterMap[Math.round(i)] = true;
    }

    const showVerticalCenterLine = () => {
      showCenterLine(canvasWidthCenter + 0.5, 0, canvasWidthCenter + 0.5, canvasHeight);
    }

    const showHorizontalCenterLine = () => {
      showCenterLine(0, canvasHeightCenter + 0.5, canvasWidth, canvasHeightCenter + 0.5);
    }

    const showCenterLine = (x1, y1, x2, y2) => {
      ctx.save();
      ctx.strokeStyle = centerLineColor;
      ctx.lineWidth = centerLineWidth;
      ctx.beginPath();
      ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3]);
      ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3]);
      ctx.stroke();
      ctx.restore();
    }

    var afterRenderActions = [],
        isInVerticalCenter,
        isInHorizontalCenter;

    canvas.on('mouse:down', function () {
      viewportTransform = canvas.viewportTransform;
    });

    canvas.on('object:moving', function(e) {
      var object = e.target,
          objectCenter = object.getCenterPoint(),
          transform = canvas._currentTransform;

      if (!transform) return;

      isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap;
          isInHorizontalCenter = Math.round(objectCenter.y) in canvasHeightCenterMap;

      if (isInHorizontalCenter || isInVerticalCenter) {
        object.setPositionByOrigin(new fabric.Point((isInVerticalCenter ? canvasWidthCenter : objectCenter.x), (isInHorizontalCenter ? canvasHeightCenter : objectCenter.y)), 'center', 'center');
      }
    });

    canvas.on('before:render', function() {
      canvas.clearContext(canvas.contextTop);
    });

    canvas.on('after:render', function() {
      if (isInVerticalCenter) {
        showVerticalCenterLine();
      }
      if (isInHorizontalCenter) {
        showHorizontalCenterLine();
      }
    });

    canvas.on('mouse:up', function() {
      // clear these values, to stop drawing guidelines once mouse is up
      isInVerticalCenter = isInHorizontalCenter = null;
      canvas.renderAll();
    });
  }

  const initAligningGuidelines = (canvas) => {

    var ctx = canvas.getSelectionContext(),
        aligningLineOffset = 5,
        aligningLineMargin = 4,
        aligningLineWidth = 1,
        aligningLineColor = 'rgb(0,255,0)',
        viewportTransform,
        zoom = 1;

    const drawVerticalLine = (coords) => {
      drawLine(
          coords.x + 0.5,
          coords.y1 > coords.y2 ? coords.y2 : coords.y1,
          coords.x + 0.5,
          coords.y2 > coords.y1 ? coords.y2 : coords.y1);
    }

    const drawHorizontalLine = (coords) => {
      drawLine(
          coords.x1 > coords.x2 ? coords.x2 : coords.x1,
          coords.y + 0.5,
          coords.x2 > coords.x1 ? coords.x2 : coords.x1,
          coords.y + 0.5);
    }

    const drawLine = (x1, y1, x2, y2) => {
      ctx.save();
      ctx.lineWidth = aligningLineWidth;
      ctx.strokeStyle = aligningLineColor;
      ctx.beginPath();
      ctx.moveTo(((x1+viewportTransform[4])*zoom), ((y1+viewportTransform[5])*zoom));
      ctx.lineTo(((x2+viewportTransform[4])*zoom), ((y2+viewportTransform[5])*zoom));
      ctx.stroke();
      ctx.restore();
    }

    const isInRange = (value1, value2) => {
      value1 = Math.round(value1);
      value2 = Math.round(value2);
      for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
        if (i === value2) {
          return true;
        }
      }
      return false;
    }

    var verticalLines = [],
        horizontalLines = [];

    canvas.on('mouse:down', function () {
      viewportTransform = canvas.viewportTransform;
      zoom = canvas.getZoom();
    });

    canvas.on('object:moving', function(e) {

      var activeObject = e.target,
          canvasObjects = canvas.getObjects(),
          activeObjectCenter = activeObject.getCenterPoint(),
          activeObjectLeft = activeObjectCenter.x,
          activeObjectTop = activeObjectCenter.y,
          activeObjectBoundingRect = activeObject.getBoundingRect(),
          activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
          activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
          horizontalInTheRange = false,
          verticalInTheRange = false,
          transform = canvas._currentTransform;

      if (!transform) return;

      // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
      // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

      for (var i = canvasObjects.length; i--; ) {

        if (canvasObjects[i] === activeObject) continue;

        var objectCenter = canvasObjects[i].getCenterPoint(),
            objectLeft = objectCenter.x,
            objectTop = objectCenter.y,
            objectBoundingRect = canvasObjects[i].getBoundingRect(),
            objectHeight = objectBoundingRect.height / viewportTransform[3],
            objectWidth = objectBoundingRect.width / viewportTransform[0];

        // snap by the horizontal center line
        if (isInRange(objectLeft, activeObjectLeft)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft,
            y1: (objectTop < activeObjectTop)
                ? (objectTop - objectHeight / 2 - aligningLineOffset)
                : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
                ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
                : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
        }

        // snap by the left edge
        if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft - objectWidth / 2,
            y1: (objectTop < activeObjectTop)
                ? (objectTop - objectHeight / 2 - aligningLineOffset)
                : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
                ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
                : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the right edge
        if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft + objectWidth / 2,
            y1: (objectTop < activeObjectTop)
                ? (objectTop - objectHeight / 2 - aligningLineOffset)
                : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
                ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
                : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the vertical center line
        if (isInRange(objectTop, activeObjectTop)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop,
            x1: (objectLeft < activeObjectLeft)
                ? (objectLeft - objectWidth / 2 - aligningLineOffset)
                : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
                ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
                : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
        }

        // snap by the top edge
        if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop - objectHeight / 2,
            x1: (objectLeft < activeObjectLeft)
                ? (objectLeft - objectWidth / 2 - aligningLineOffset)
                : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
                ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
                : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
        }

        // snap by the bottom edge
        if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop + objectHeight / 2,
            x1: (objectLeft < activeObjectLeft)
                ? (objectLeft - objectWidth / 2 - aligningLineOffset)
                : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
                ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
                : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
        }
      }

      if (!horizontalInTheRange) {
        horizontalLines.length = 0;
      }

      if (!verticalInTheRange) {
        verticalLines.length = 0;
      }
    });

    canvas.on('before:render', function() {
      canvas.clearContext(canvas.contextTop);
    });

    canvas.on('after:render', function() {
      for (var i = verticalLines.length; i--; ) {
        drawVerticalLine(verticalLines[i]);
      }
      for (var i = horizontalLines.length; i--; ) {
        drawHorizontalLine(horizontalLines[i]);
      }

      verticalLines.length = horizontalLines.length = 0;
    });

    canvas.on('mouse:up', function() {
      verticalLines.length = horizontalLines.length = 0;
      canvas.renderAll();
    });
  }

  const objectScaling = (e)=>{
    let tempObjs = tempCanvas._objects;
    let itex = tempObjs.find(f=>f.name === 'iText' && f.id === e.target.id);
    let itexH = tempObjs.find(f=>f.name === 'iTextH' && f.id === e.target.id);
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
