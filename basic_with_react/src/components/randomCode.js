//

// import React from "react";
// import { fabric } from "fabric";

// const RandomCode = () => {
//   (function () {
//     // manually initialize 2 filter backend to give ability to switch:
//     var canvas2dBackend = new fabric.Canvas2dFilterBackend();

//     fabric.filterBackend = fabric.initFilterBackend();
//     fabric.Object.prototype.transparentCorners = false;
//     var $ = function (id) {
//       return document.getElementById(id);
//     };

//     function applyFilter(index, filter) {
//       var obj = canvas.getActiveObject();
//       obj.filters[index] = filter;
//       var timeStart = +new Date();
//       obj.applyFilters();
//       var timeEnd = +new Date();
//       var dimString =
//         canvas.getActiveObject().width +
//         " x " +
//         canvas.getActiveObject().height;
//       $("bench").innerHTML =
//         dimString + "px " + parseFloat(timeEnd - timeStart) + "ms";
//       canvas.renderAll();
//     }

//     fabric.Object.prototype.padding = 5;
//     fabric.Object.prototype.transparentCorners = false;

//     var canvas = new fabric.Canvas("c"),
//       f = fabric.Image.filters;

//     canvas.on({
//       "selection:created": function () {
//         fabric.util
//           .toArray(document.getElementsByTagName("input"))
//           .forEach(function (el) {
//             el.disabled = false;
//           });

//         var filters = ["sepia", "brownie"];

//         for (var i = 0; i < filters.length; i++) {
//           $(filters[i]) &&
//             ($(filters[i]).checked = !!canvas.getActiveObject().filters[i]);
//         }
//       },
//       "selection:cleared": function () {
//         fabric.util
//           .toArray(document.getElementsByTagName("input"))
//           .forEach(function (el) {
//             el.disabled = true;
//           });
//       },
//     });

//     // fabric.Image.fromURL(
//     //   "http://fabricjs.com/site_assets//video-element.png",
//     //   function (img) {
//     //     var oImg = img.set({ left: 0, top: 0 }).scale(0.25);
//     //     canvas.add(oImg);
//     //   }
//     // );

//     $("webgl").onclick = function () {
//       if (this.checked) {
//         fabric.filterBackend = canvas2dBackend;
//       } else {
//       }
//     };
//     $("brownie").onclick = function () {
//       applyFilter(4, this.checked && new f.Brownie());
//     };
//     $("sepia").onclick = function () {
//       applyFilter(3, this.checked && new f.Sepia());
//     };

//     var imageElement = document.createElement("img");
//     imageElement.src = "http://fabricjs.com/site_assets//video-element.png";
//     var fImage = new fabric.Image(imageElement);
//     fImage.scaleX = 1;
//     fImage.scaleY = 1;
//     fImage.top = 15;
//     fImage.left = 15;
//   })();

//   return <div>randomCode</div>;
// };

// export default RandomCode;
// import { useState } from "react";
// function Toggle() {
//   const [isToggleOn, setIsToggle] = useState(true);
//   function handleClick() {
//     setIsToggle((prevCheck) => !prevCheck);
//   }
//   return <button onClick={handleClick}>{isToggleOn ? "ON" : "OFF"}</button>;
// }
// export default Toggle;


