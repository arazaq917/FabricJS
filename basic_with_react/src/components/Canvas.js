import React, { useState, useEffect } from "react";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import CanvasSection from "./CanvasSection";
import { useDispatch, useSelector } from "react-redux";
import { canvasAction } from "../store/CanvasSlice";
import { fabric } from "fabric";
import "fabric-history";

const Canvas = () => {
  let [canvas, setCanvas] = useState();
  const [text, setText] = useState("");
  const [svgColor, setSvgColor] = useState([]);
  const [objArr, setObjArr] = useState([]);

  // const dispatch = useDispatch();
  // const canvas = useSelector((state) => state.canvas);
  useEffect(() => {
    let canvas = new fabric.Canvas('canvas', {
      width: 600,
      height: 600,
      backgroundColor: "#c6c7c5",
    });
    setCanvas(canvas)
    canvas.renderAll()
    // dispatch(canvasAction.initCanvas("canvas"));
  }, []);

  // Canvas Function
  window.canvas = canvas;
  const onChange = () => {
    let objArr=[]
    canvas.getActiveObject().setCoords();
    canvas.forEachObject(function(obj) {
      // if (obj === canvas.getActiveObject()) return;
      if(canvas.getActiveObject().intersectsWithObject(obj)){
        objArr.push(obj)
      }
    });
    canvas.discardActiveObject();
    let sel = new fabric.ActiveSelection(objArr, {
      canvas: canvas,
    });
    canvas.setActiveObject(sel);
    canvas.getActiveObject().toGroup();
    console.log("Array",objArr)
    canvas.renderAll()
  }

  let deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

  let img = document.createElement('img');
  img.src = deleteIcon;

  const deleteObj=(eventData, transform) =>{
    let target = transform.target;
    let canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
  }
  const renderIcon = (ctx, left, top, styleOverride, fabricObject) => {
    let size = 24;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(img, -size/2, -size/2, size, size);
    ctx.restore();
  }

  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = 'blue';
  fabric.Object.prototype.cornerStyle = 'circle';

  fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObj,
    render: renderIcon,
    cornerSize: 24
  });

  let color = "#000000";
  let currentMode;
  const modes = {
    pan: "pan",
    drawing: "drawing",
  };

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

  const addCircle = () => {
    let circle = new fabric.Circle({
      radius: 50,
      left: 250,
      top: 250,
      fill: "#aac",
      borderColor: "red",
      strokeWidth: 3,
      stroke: "#880E4F",
      cornerColor: "white",
      transparentCorners: false,
      id: Date().toString(),
    });
    setObjArr([...objArr, circle]);
    canvas.add(circle);
    canvas.centerObject(circle);
    canvas.setActiveObject(circle);
    canvas.isDrawingMode = false;
    canvas.renderAll();
  };
  const addRect = () => {
    let rect = new fabric.Rect({
      width: 100,
      height: 150,
      left: 200,
      top: 250,
      fill: "rgba(255,0,0,0.5)",
      borderColor: "red",
      strokeWidth: 3,
      stroke: "#880E4F",
      cornerColor: "white",
      transparentCorners: false,
      id: Date().toString(),
    });
    setObjArr([...objArr, rect]);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.centerObject(rect);
    canvas.isDrawingMode = false;
    canvas.renderAll();
  };
  const addPoly = () => {
    let polygon = new fabric.Polygon([
      { x: 200, y: 10 },
      { x: 250, y: 50 },
      { x: 250, y: 100},
      { x: 150, y: 100},
      { x: 150, y: 50 }], {
      fill: 'green',
      borderColor: "red",
      strokeWidth: 3,
      stroke: "#880E4F",
      cornerColor: "white",
      transparentCorners: false,
      id: Date().toString(),
    });
    setObjArr([...objArr, polygon]);
    canvas.add(polygon);
    canvas.centerObject(polygon);
    canvas.setActiveObject(polygon);
    canvas.isDrawingMode = false;
    canvas.renderAll();
  };
  const addLine = () => {
    let line = new fabric.Line([50, 10, 200, 150], {
      stroke: 'green',
      borderColor: "red",
      strokeWidth: 3,
      cornerColor: "white",
      transparentCorners: false,
      id: Date().toString(),
    });
    setObjArr([...objArr, line]);
    canvas.add(line);
    canvas.centerObject(line);
    canvas.setActiveObject(line);
    canvas.isDrawingMode = false;
    canvas.renderAll();
  };
  const toggleMode = (mode) => {
    if (mode === modes.pan) {
      if (currentMode === modes.pan) {
        currentMode = "";
      } else {
        currentMode = modes.pan;
        canvas.isDrawingMode = false;
        canvas.renderAll();
      }
    } else if (mode === modes.drawing) {
      if (currentMode === modes.drawing) {
        currentMode = "";
        canvas.isDrawingMode = false;
        canvas.renderAll();
      } else {
        currentMode = modes.drawing;
        canvas.isDrawingMode = true;
        canvas.renderAll();
      }
    }
    console.log("Current Mode", mode);
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

  const AddText = () => {
    let activeObject = canvas.getActiveObject()
    if(!activeObject){
      return;
    }
    let left = activeObject.left
    let top = activeObject.top
    let text = new fabric.Text("hello world", {
      cornerColor: "white",
      left: left,
      top: top-50,
      borderColor: "red",
      fontSize:18,
      transparentCorners: false,
      id: Date().toString(),
    });
    text.on("selected", function () {
      setText(text.text);
    });
    text.on("deselected", function () {
      setText("");
    });
    setObjArr([...objArr, text]);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.isDrawingMode = false;
  };
  const deleteObject = () => {
    addNewState();
    let target = canvas.getActiveObject();
    canvas.remove(target);
    canvas.requestRenderAll();
  };
  const customImage = (img) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      let imgObj = new Image();
      imgObj.src = e.target.result;
      imgObj.onload = function () {
        let image = new fabric.Image(imgObj);
        image.set({
          cornerColor: "white",
          borderColor: "red",
          transparentCorners: false,
          scaleX: 1,
          scaleY: 1,
          width:canvas.width,
          height:canvas.height
        });
        canvas.setBackgroundImage(image);
        setObjArr([...objArr, image]);
        canvas.renderAll();
      };
    };
    reader.readAsDataURL(img.target.files[0]);
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

  const changeTxt = (txt) => {
    let target = canvas.getActiveObject();
    if (target.type === "text" || target.type === "textbox") {
      target.text = txt;
      setText(target.text);
      canvas.renderAll();
    }
  };

  const setTextProperty = (txt) => {
    let target = canvas.getActiveObject();
    switch (txt) {
      case "bold": {
        let isBold = target.fontWeight === "bold";
        if (isBold) {
          target.set({ fontWeight: "normal" });
        } else {
          target.set({ fontWeight: "bold" });
        }
        canvas.renderAll();
        break;
      }
      case "underline": {
        let isUnderLine = target.underline;
        if (isUnderLine) {
          target.set({ underline: false });
        } else {
          target.set({ underline: true });
        }
        canvas.renderAll();
        break;
      }
      case "italic": {
        let isItalic = target.fontStyle === "italic";
        if (isItalic) {
          target.set({ fontStyle: "normal" });
        } else {
          target.set({ fontStyle: "italic" });
        }
        canvas.renderAll();
        break;
      }
      default:
    }
  };

  const loadObj = (e) => {
    let i;
    objArr.forEach((item, index) => {
      if (item.id === e) {
        i = index;
      }
    });
    canvas.add(objArr[i]);
    // canvas.loadFromJSON(`{"objects":[${objArr[index]}],"background":"rgb(198, 199, 197)"}`);
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
  const zoomOutCanvas=()=>{
    canvas.setHeight(canvas.height-10);
    canvas.setWidth(canvas.width-10);
  }
  const zoomInCanvas=()=>{
    canvas.setHeight(canvas.height+10);
    canvas.setWidth(canvas.width+10);
  }
  return (
    <>
      <div className="mainBody">
        <div>
          <LeftSection
            addLine={addLine}
            addPoly={addPoly}
            addCircle={addCircle}
            addRect={addRect}
            draw={toggleMode}
            addTxt={AddText}
            customImg={customImage}
          />
        </div>
        <div>
          <CanvasSection
            clearHistory={clearHistory}
            clear={clear}
            delete={deleteObject}
            save={saveCanvas}
            zoomInCanvas={zoomInCanvas}
            zoomOutCanvas={zoomOutCanvas}
            onChange={onChange}
          />
        </div>
        <div>
          <RightSection
            color={colorPicker}
            newTxt={changeTxt}
            text={text}
            txtProp={setTextProperty}
            svgColor={svgColor[0]}
            arr={objArr}
            loadObj={loadObj}
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
