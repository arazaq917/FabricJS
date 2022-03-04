import { useEffect, useState } from "react";
import { fabric } from "fabric";
import "fabric-history";
import LeftSection from "./components/LeftSection";
import RightSection from "./components/RightSection";
import CanvasSection from "./components/CanvasSection";
import { useDispatch, useSelector } from "react-redux";
import { canvasAction } from "./store/CanvasSlice";
import "./App.css";
import Toggle from "./components/randomCode";

function App() {
  const [text, setText] = useState("");
  const [svgColor, setSvgColor] = useState([]);
  const [objArr, setObjArr] = useState([]);

  const dispatch = useDispatch();
  const canvas = useSelector((state) => state.canvas);
  // console.log("Rendered", initCanv);

  useEffect(() => {
    dispatch(canvasAction.initCanvas("canvas"));
    // const mainCanvas = initCanvas("canvas");
    // setCanvas(mainCanvas)
  }, []);

  // Canvas Function
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
  };

  const addCircle = () => {
    var circle = new fabric.Circle({
      radius: 50,
      left: 250,
      top: 250,
      fill: "#aac",
      borderColor: "red",
      strokeWidth: 3,
      stroke: "#880E4F",
      cornerColor: "white",
      id: Date().toString(),
    });
    // circle.on("selected", function () {
    //   console.log("selected a circle");
    // });
    setObjArr([...objArr, circle]);
    canvas.add(circle);
    canvas.isDrawingMode = false;
    canvas.renderAll();
  };
  const addRect = () => {
    var rect = new fabric.Rect({
      width: 200,
      height: 100,
      left: 200,
      top: 250,
      fill: "rgba(255,0,0,0.5)",
      borderColor: "red",
      strokeWidth: 3,
      stroke: "#880E4F",
      cornerColor: "white",
      id: Date().toString(),
    });
    var animateBtn = document.getElementById("btn");
    animateBtn.onclick = function () {
      let target = canvas.getActiveObject();
      animateBtn.disabled = true;
      target.animate("left", target.left === 100 ? 400 : 100, {
        duration: 1000,
        onChange: canvas.renderAll.bind(canvas),
        onComplete: function () {
          animateBtn.disabled = false;
        },
        easing: fabric.util.ease.easeOutBounce,
      });
    };
    setObjArr([...objArr, rect]);
    canvas.add(rect);
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
    var text = new fabric.Text("hello world", {
      cornerColor: "white",
      left: 200,
      top: 250,
      borderColor: "red",
      id: Date().toString(),
    });
    text.on("selected", function () {
      setText(text.text);
    });
    text.on("deselected", function () {
      setText("");
    });
    console.log(text);
    setObjArr([...objArr, text]);
    canvas.centerObject(text);
    canvas.add(text);
    canvas.isDrawingMode = false;
  };
  const AddTextbox = () => {
    var textbox = new fabric.Textbox("hello i am textbox", {
      cornerColor: "white",
      borderColor: "red",
      width: 450,
      id: Date().toString(),
    });
    textbox.on("selected", function () {
      setText(textbox.text);
    });
    textbox.on("deselected", function () {
      setText("");
    });
    setObjArr([...objArr, textbox]);
    canvas.centerObject(textbox);
    canvas.add(textbox);
    canvas.isDrawingMode = false;
  };
  const deleteObject = () => {
    addNewState();
    let target = canvas.getActiveObject();
    canvas.remove(target);
    canvas.requestRenderAll();
  };
  const addImage = () => {
    fabric.Image.fromURL("http://localhost:3000/images/a.jpg", (oImg) => {
      oImg.scale(0.5).set({
        flipX: true,
        top: 200,
        left: 200,
        cornerColor: "white",
        borderColor: "red",
        crossOrigin: "anonymous",
        id: Date().toString(),
      });
      setObjArr([...objArr, oImg]);
      canvas.add(oImg);
      canvas.isDrawingMode = false;
    });
  };

  const applyFilter = (fill) => {
    switch (fill) {
      case "sepia": {
        var obj = canvas.getActiveObject();
        if (!obj.filters[0]) {
          obj.filters[0] = new fabric.Image.filters.Sepia();
        } else {
          delete obj.filters[0];
          obj.filters[0] = new fabric.Image.filters.Sepia();
        }
        obj.applyFilters();
        canvas.renderAll();
        break;
      }
      case "brownie": {
        obj = canvas.getActiveObject();
        if (!obj.filters[0]) {
          obj.filters[0] = new fabric.Image.filters.Brownie();
        } else {
          delete obj.filters[0];
          obj.filters[0] = new fabric.Image.filters.Brownie();
        }
        obj.applyFilters();
        canvas.renderAll();
        break;
      }
      case "vintage": {
        obj = canvas.getActiveObject();
        if (obj.filters[0]) {
          obj.filters[0] = new fabric.Image.filters.Vintage();
        } else {
          delete obj.filters[0];
          obj.filters[0] = new fabric.Image.filters.Vintage();
        }
        obj.applyFilters();
        canvas.renderAll();
        break;
      }
      case "clear": {
        obj = canvas.getActiveObject();
        if (obj.filters) {
          obj.filters = [];
        }
        obj.applyFilters();
        canvas.renderAll();

        break;
      }
      default:
    }
  };

  const addSVG = () => {
    fabric.loadSVGFromURL("http://localhost:3000/images/4.svg", (objects) => {
      var svg = fabric.util.groupSVGElements(objects, {
        left: 165,
        top: 100,
        scaleX: 0.1,
        scaleY: 0.1,
        cornerColor: "white",
        borderColor: "red",
        id: Date().toString(),
      });
      if (svg._objects) {
        var a = [];
        let i = 0;
        svg._objects.forEach((c) => {
          svg._objects[i].id = i;
          if (a.find((e) => e.color === c.fill)) {
          } else {
            a = [...a, { color: c.fill, id: c.id }];
          }
          i++;
        });
        setSvgColor([...svgColor, a]);
      }
      setObjArr([...objArr, svg]);
      console.log(a);
      canvas.centerObject(svg);
      canvas.add(svg);
      canvas.isDrawingMode = false;
      canvas.renderAll();
    });
  };

  const svgFiller = (c) => {
    let target = canvas.getActiveObject();
    switch (c.target.id) {
      case "0": {
        let obj = target._objects[0];
        obj.set("fill", c.target.value);
        obj = target._objects[4];
        obj.set("fill", c.target.value);
        canvas.renderAll();
        break;
      }
      case "1": {
        let obj = target._objects[1];
        obj.set("fill", c.target.value);
        obj = target._objects[5];
        obj.set("fill", c.target.value);
        canvas.renderAll();
        break;
      }
      case "2": {
        let obj = target._objects[2];
        obj.set("fill", c.target.value);
        obj = target._objects[6];
        obj.set("fill", c.target.value);
        canvas.renderAll();
        break;
      }
      case "3": {
        let obj = target._objects[3];
        obj.set("fill", c.target.value);
        obj = target._objects[7];
        obj.set("fill", c.target.value);
        canvas.renderAll();
        break;
      }
      default:
    }
    canvas.renderAll();
  };

  const customImage = (img) => {
    var reader = new FileReader();
    reader.onload = (e) => {
      var imgObj = new Image();
      imgObj.src = e.target.result;
      imgObj.onload = function () {
        var image = new fabric.Image(imgObj);
        image.set({
          cornerColor: "white",
          borderColor: "red",
          scaleX: 0.5,
          scaleY: 0.5,
        });
        setObjArr([...objArr, image]);
        canvas.centerObject(image);
        canvas.add(image);
        canvas.isDrawingMode = false;
        canvas.renderAll();
      };
    };
    reader.readAsDataURL(img.target.files[0]);
  };

  const saveCanvas = () => {
    const img = canvas.toDataURL();
    var link = document.createElement("a");
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
    var i;
    objArr.forEach((item, index) => {
      if (item.id === e) {
        i = index;
      }
    });
    canvas.add(objArr[i]);
    // canvas.loadFromJSON(`{"objects":[${objArr[index]}],"background":"rgb(198, 199, 197)"}`);
  };

  // var arr = [];
  // var isRedoing = false;
  // const undo = () => {
  //   if (canvas._objects.length > 0) {
  //     canvas.discardActiveObject();
  //     arr.push(canvas._objects.pop());
  //     canvas.renderAll();
  //   }
  // };
  // const redo = () => {
  //   if (arr.length > 0) {
  //     canvas.add(arr.pop());
  //   }
  // };

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

  var undoStack = [];
  const retrieveLastState = () => {
    var latestState = undoStack[undoStack.length - 1];
    var parsedJSON = JSON.parse(latestState);
    canvas.loadFromJSON(parsedJSON);
    canvas.renderAll();
  };

  return (
    <>
      <div className="mainBody">
        <button id="btn">U</button>
        <div>
          <LeftSection
            addCircle={addCircle}
            addRect={addRect}
            draw={toggleMode}
            addTxt={AddText}
            addTxtbox={AddTextbox}
            image={addImage}
            customImg={customImage}
            svg={addSVG}
          />
        </div>
        <div>
          <CanvasSection
            clearHistory={clearHistory}
            clear={clear}
            delete={deleteObject}
            save={saveCanvas}
            restore={retrieveLastState}
          />
        </div>
        <div>
          <RightSection
            color={colorPicker}
            newTxt={changeTxt}
            text={text}
            txtProp={setTextProperty}
            svgColor={svgColor[0]}
            svgFiller={svgFiller}
            arr={objArr}
            loadObj={loadObj}
            undo={undo}
            redo={redo}
            filter={applyFilter}
            canvas={canvas}
          />
        </div>
      </div>
    </>
  );
}

export default App;
