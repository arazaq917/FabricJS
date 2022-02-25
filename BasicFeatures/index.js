console.log("Hello");
// const canvas = new fabric.Canvas("canvas", {
//   width: 500,
//   height: 500,
// });

// canvas.renderAll();

// fabric.Image.fromURL(
//   "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sky.jpg/1280px-Sky.jpg",
//   (img) => {
//     canvas.backgroundImage = img;
//     canvas.renderAll();
//   }
// );

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
      canvas.freeDrawingBrush.color = color;
      canvas.renderAll();
    }
  }
  console.log("Current Mode", mode);
};

let mousePressed = false;
let color = "#000000";

const setBackground = (url, canvas) => {
  fabric.Image.fromURL(url, (img) => {
    canvas.backgroundImage = img;
    canvas.renderAll();
  });
};

const initCanvas = (id) => {
  return new fabric.Canvas(id, {
    width: 600,
    height: 600,
    selection: false,
  });
};

const setPanEvents = (canvas) => {
  canvas.on("mouse:move", (event) => {
    if (mousePressed && currentMode === modes.pan) {
      canvas.setCursor("grab");
      canvas.renderAll();
      const mEvent = event.e;
      const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
      canvas.relativePan(delta);
    }
  });

  canvas.on("mouse:down", (event) => {
    mousePressed = true;
    if (currentMode === modes.pan) {
      canvas.setCursor("grab");
      console.log("corsshair");
      canvas.renderAll();
    }
  });

  canvas.on("mouse:up", (event) => {
    mousePressed = false;
    canvas.setCursor("default");
    canvas.renderAll();
  });
};

const setColorPicker = () => {
  const picker = document.getElementById("colorPicker");
  picker.addEventListener("change", (event) => {
    console.log("event..", event.target.value);
    color = event.target.value;
    console.log("color..", color);
    canvas.freeDrawingBrush.color = color;
    canvas.renderAll();
  });
};

let currentMode;
const modes = {
  pan: "pan",
  drawing: "drawing",
};

const createRect = (canvas) => {
  const cntr = canvas.getCenter();
  console.log("ist wroking Rect");
  const rect = new fabric.Rect({
    width: 100,
    height: 100,
    fill: "green",
    top: cntr.top,
    left: cntr.left,
    cornerColor:'white'
  });
  canvas.add(rect);
  canvas.renderAll();
};
const createCirc = (canvas) => {
  const cntr = canvas.getCenter();
  console.log("ist wroking");
  const cir = new fabric.Circle({
    radius: 70,
    originX: "center",
    originY: "center",
    fill: color,
    top: cntr.top,
    left: cntr.left,
    cornerColor:'white'

  });
  canvas.add(cir);
  canvas.renderAll();
};

const clearCanvas = (canvas) => {
  canvas.getObjects().forEach((obj) => {
    if (obj !== canvas.backgroundImage) {
      canvas.remove(obj);
    }
  });
};

const canvas = initCanvas("canvas");
setBackground(
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sky.jpg/1280px-Sky.jpg",
  canvas
);

setPanEvents(canvas);
setColorPicker();
