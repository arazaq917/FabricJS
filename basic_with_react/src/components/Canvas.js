import React, { useState, useEffect } from "react";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import CanvasSection from "./CanvasSection";
import { useDispatch, useSelector } from "react-redux";
import { canvasAction } from "../store/CanvasSlice";
import { fabric } from "fabric";
import "fabric-history";
import { v4 as uuid } from 'uuid';
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
          // 'object:moved' : movedObject,
          'object:modified' : modifiedObject,
          'object:scaling':objectScaling,
          'object:scaled':objectScaled,
          // 'object:resizing':objectScaling,
          'object:rotating':objectRotating
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
        centerLineColor = 'rgba(28,233,12,0.5)',
        centerLineWidth = 2,
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
      if (!viewportTransform?.length) return;
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
        aligningLineWidth = 2,
        aligningLineColor = 'rgb(173,14,120)',
        viewportTransform,
        zoom = 1;

    const drawVerticalLine = (coords,isBetFlag=false) => {
      drawLine(
          coords.x + 0.5,
          coords.y1 > coords.y2 ? coords.y2 : coords.y1,
          coords.x + 0.5,
          coords.y2 > coords.y1 ? coords.y2 : coords.y1,
          isBetFlag);
    }

    const drawHorizontalLine = (coords,isBetFlag=false) => {
      drawLine(
          coords.x1 > coords.x2 ? coords.x2 : coords.x1,
          coords.y + 0.5,
          coords.x2 > coords.x1 ? coords.x2 : coords.x1,
          coords.y + 0.5,
          isBetFlag);
    }

    const drawLine = (x1, y1, x2, y2,isBetFlag) => {
      ctx.save();
      ctx.lineWidth = aligningLineWidth;
      ctx.strokeStyle = aligningLineColor;
      if (isBetFlag) {
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgb(0,255,0)';
      }
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

      for (var i = canvasObjects.length; i--; ) {

        if (canvasObjects[i] === activeObject || canvasObjects[i].type !== 'group' ) continue;
        var objectCenter = canvasObjects[i].getCenterPoint(),
            objectLeft = objectCenter.x,
            objectTop = objectCenter.y,
            objectBoundingRect = canvasObjects[i].getBoundingRect(),
            objectHeight = objectBoundingRect.height / viewportTransform[3],
            objectWidth = objectBoundingRect.width / viewportTransform[0];

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
        // MIDDLE LINE FOR COMMON WIDTH
        if (isInRange(objectLeft + (objectWidth / 2), activeObjectLeft - activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft + objectWidth / 2,
            y1: (objectTop < activeObjectTop)
                ? (objectTop - objectHeight / 2)
                : (objectTop + objectHeight / 2),
            y2: (activeObjectTop > objectTop)
                ? (activeObjectTop + activeObjectHeight / 2)
                : (activeObjectTop - activeObjectHeight / 2),
            inBetFlag:true
          });
          // activeObject.setPositionByOrigin({x:objectLeft + objectWidth / 2 + ((activeObjectWidth / 2) - 5),y: activeObjectTop}, 'center', 'center');
        }
        // MIDDLE LINE FOR COMMON WIDTH
        if (isInRange(objectLeft - (objectWidth / 2), activeObjectLeft + activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft - (objectWidth / 2),
            y1: (objectTop < activeObjectTop)
                ? (objectTop - objectHeight / 2)
                : (objectTop + objectHeight / 2),
            y2: (activeObjectTop > objectTop)
                ? (activeObjectTop + activeObjectHeight / 2)
                : (activeObjectTop - activeObjectHeight / 2),
            inBetFlag:true
          });
          // activeObject.setPositionByOrigin({x:objectLeft + objectWidth / 2 + ((activeObjectWidth / 2) - 5),y: activeObjectTop}, 'center', 'center');
        }
        // MIDDLE LINE FOR COMMON HEIGHT
        if (isInRange(objectTop - objectHeight/2, activeObjectTop + activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop - objectHeight/2,
            x1: (objectLeft < activeObjectLeft)
                ? (objectLeft - objectWidth / 2)
                : (objectLeft + objectWidth / 2),
            x2: (activeObjectLeft > objectLeft)
                ? (activeObjectLeft + activeObjectWidth / 2)
                : (activeObjectLeft - activeObjectWidth / 2),
            inBetFlag:true
          });
          // activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
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
        if (verticalLines[i].hasOwnProperty('inBetFlag')){
          drawVerticalLine(verticalLines[i],true);
        }else drawVerticalLine(verticalLines[i]);
      }
      for (var i = horizontalLines.length; i--; ) {
        if (horizontalLines[i].hasOwnProperty('inBetFlag')){
          drawHorizontalLine(horizontalLines[i],true);
        }else drawHorizontalLine(horizontalLines[i]);

      }

      verticalLines.length = horizontalLines.length = 0;
    });

    canvas.on('mouse:up', function() {
      verticalLines.length = horizontalLines.length = 0;
      canvas.renderAll();
    });
  }
  const reInitPath=(path,props=[],obj)=>{
    let options ={
      stroke : props.stroke,
      strokeWidth : props.strokeWidth,
      fill : props.fill,
      hasBorders : props.hasBorders,
      id : props.id,
      evented:false,
      selectable:false,
      hasControls : props.hasControls,
      name : props.name};
    var newPath = new fabric.Path(path, options);
    if (obj) tempCanvas.remove(obj);
    return newPath;
  }
  const setObjectDimensions =(rect)=>{
    if (!rect) return;
    let tempObjs = tempCanvas._objects;
    let leftSide;
    let rightSide;
    let rightSideInd = -1;
    let leftSideInd = -1;

    if (rect.side === 'top'){
      setTopWindowDimensions(rect)
      return;
    }

    if (rect.side === "left"){
      leftSide = rect;
      rightSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "right")
    }else {
      rightSide = rect;
      leftSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "left")
    }
    if (leftSideInd > -1) leftSide = tempObjs[leftSideInd];
    if (rightSideInd > -1) rightSide = tempObjs[rightSideInd]


    let bottomTextInd = tempObjs.findIndex(f=>f.name === 'iText' && f.id === rect.id);
    let leftTextInd = tempObjs.findIndex(f=>f.name === 'iTextH' && f.id === rect.id);
    let bottomLeftLineInd = tempObjs.findIndex(f=>f.name === 'bottom_left_line' && f.id === rect.id);
    let bottomRightLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_line' && f.id === rect.id);
    let leftTopLineInd = tempObjs.findIndex(f=>f.name === 'left_top_line' && f.id === rect.id);
    let leftBottomLineInd = tempObjs.findIndex(f=>f.name === 'left_bottom_line' && f.id === rect.id);

    let bottomRightDashedLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_dashed_line' && f.id === rect.id);
    let leftNodeDashInd = tempObjs.findIndex(f=>f.name === 'leftNodeDash' && f.id === rect.id);
    let rightNodeDashInd = tempObjs.findIndex(f=>f.name === 'rightNodeDasn' && f.id === rect.id);


    //is right side exist

    let fullLineTextInd;
    if (rightSide){
      fullLineTextInd = tempObjs.findIndex(f=>f.name === 'full_line_text' && f.id.includes(rightSide.id));
    }

    if (bottomTextInd === -1 || leftTextInd === -1 || bottomLeftLineInd === -1 || bottomRightLineInd === -1|| leftTopLineInd === -1|| leftBottomLineInd === -1 || bottomRightDashedLineInd === -1 || leftNodeDashInd === -1 || rightNodeDashInd === -1) return;;
    let bottomText = tempObjs[bottomTextInd];
    let leftText = tempObjs[leftTextInd];
    let bottomLeftLine = tempObjs[bottomLeftLineInd];
    let bottomRightLine = tempObjs[bottomRightLineInd];
    let leftTopLine = tempObjs[leftTopLineInd];
    let leftBottomLine = tempObjs[leftBottomLineInd];
    let bottomRightDashedLine = tempObjs[bottomRightDashedLineInd];
    let leftNodeDash = tempObjs[leftNodeDashInd];
    let rightNodeDash = tempObjs[rightNodeDashInd];

    let objScaledWidth = rect.getScaledWidth();
    let objScaledHeight = rect.getScaledHeight();
    const bottomOffset = 10;
    const leftOffset = 20;
    bottomText.top = (rect.top + objScaledHeight) + bottomOffset;
    bottomText.left = rect.left + (objScaledWidth/2) - (bottomText.getScaledWidth()/2);

    let fullLineText;

    if (fullLineTextInd > -1) fullLineText = tempObjs[fullLineTextInd];

    if (rightSide && fullLineText){
      fullLineText.left =  rightSide.left - (fullLineText.getScaledWidth()/2);
      fullLineText.top = bottomText.top + (bottomText.getScaledHeight() * 0.78);
    }
    if (rect.side === "right"){
      leftText.left = (rect.left + objScaledWidth) + leftOffset;
      leftText.top =  rect.top + (objScaledHeight/2);
    }else {
      leftText.left = rect.left - leftOffset;
      leftText.top =  rect.top + (objScaledHeight/2);
    }



    //ADJUST LINES


    bottomLeftLine.left = rect.left;
    bottomLeftLine.top = bottomText.top + bottomText.getScaledHeight()/4;

    bottomRightLine.top = bottomText.top + bottomText.getScaledHeight()/4;
    bottomRightLine.left = bottomText.left + bottomText.getScaledWidth() + (bottomText.getScaledWidth() * 0.1);

    bottomRightDashedLine.left = rect.left;
    bottomRightDashedLine.top = leftNodeDash.top =  bottomText.top + bottomText.getScaledHeight() * 2;

    leftNodeDash.left = rect.left;
    leftNodeDash.top =  bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight() * 0.68);

    rightNodeDash.left = rect.left + rect.getScaledWidth();
    rightNodeDash.top = bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight() * 0.68);

    leftTopLine.left = leftText.left - 5;
    leftTopLine.top = rect.top;
    leftBottomLine.left  = leftText.left - 5;
    leftBottomLine.top = leftText.top + (leftText.getScaledWidth()/2);

    if (rightSide && fullLineText){
      if (rect.side === "left") fullLineText.text = `${Math.trunc(rightSide.getScaledWidth() + rect.getScaledWidth())}`;
      else fullLineText.text = `${Math.trunc(leftSide.getScaledWidth() + rect.getScaledWidth())}`;
    }
    tempCanvas.requestRenderAll();
  }
  const setTopWindowDimensions =(rect)=>{
    if (!rect) return;
    let tempObjs = tempCanvas._objects;
      const rangeFlag = inHeightRange();

    let bottomTextInd = tempObjs.findIndex(f=>f.name === 'topText' && f.id === rect.id);
    let leftTextInd = tempObjs.findIndex(f=>f.name === 'iTextH' && f.id === rect.id);
    let bottomLeftLineInd = tempObjs.findIndex(f=>f.name === 'bottom_left_line' && f.id === rect.id);
    let bottomRightLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_line' && f.id === rect.id);
    let leftTopLineInd = tempObjs.findIndex(f=>f.name === 'left_top_line' && f.id === rect.id);
    let leftBottomLineInd = tempObjs.findIndex(f=>f.name === 'left_bottom_line' && f.id === rect.id);

    let bottomRightDashedLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_dashed_line' && f.id === rect.id);
    let leftNodeDashInd = tempObjs.findIndex(f=>f.name === 'leftNodeDash' && f.id === rect.id);
    let rightNodeDashInd = tempObjs.findIndex(f=>f.name === 'rightNodeDasn' && f.id === rect.id);

    if (bottomTextInd === -1 || leftTextInd === -1 || bottomLeftLineInd === -1 || bottomRightLineInd === -1|| leftTopLineInd === -1|| leftBottomLineInd === -1 || bottomRightDashedLineInd === -1 || leftNodeDashInd === -1 || rightNodeDashInd === -1) return;;
    let topText = tempObjs[bottomTextInd];
    let leftText = tempObjs[leftTextInd];
    let bottomLeftLine = tempObjs[bottomLeftLineInd];
    let bottomRightLine = tempObjs[bottomRightLineInd];
    let leftTopLine = tempObjs[leftTopLineInd];
    let leftBottomLine = tempObjs[leftBottomLineInd];
    let bottomRightDashedLine = tempObjs[bottomRightDashedLineInd];
    let leftNodeDash = tempObjs[leftNodeDashInd];
    let rightNodeDash = tempObjs[rightNodeDashInd];

    let objScaledWidth = rect.getScaledWidth();
    let objScaledHeight = rect.getScaledHeight();
    const bottomOffset = 10;
    const leftOffset = 20;
    topText.set('top', rect.top - topText.getScaledWidth()/2 - bottomOffset);
    topText.set('left', rect.left + (objScaledWidth/2) - (topText.getScaledWidth()/2));

    if (rangeFlag && rangeFlag === 'right_top'){
        leftText.left = (rect.left + rect.getScaledWidth()) + leftOffset;
        leftText.top = rect.top + (rect.getScaledHeight()/2);

        bottomLeftLine.left = rect.left;
        bottomLeftLine.top = topText.top + topText.getScaledHeight()/4;

        bottomRightLine.top = topText.top + topText.getScaledHeight()/4;
        bottomRightLine.left = topText.left + topText.getScaledWidth() + (topText.getScaledWidth() * 0.1);

        bottomRightDashedLine.left = rect.left;
        bottomRightDashedLine.top  =  topText.top - (topText.getScaledHeight()/4.8);

        leftNodeDash.left = rect.left-1;
        leftNodeDash.top = rightNodeDash.top =  topText.top - (topText.getScaledHeight()/2);

        rightNodeDash.left = rect.left + objScaledWidth;

        leftTopLine.left = leftText.left - 5;
        leftTopLine.top = rect.top;
        leftBottomLine.left  = leftText.left - 5;
        leftBottomLine.top = leftText.top + (leftText.getScaledWidth()/2);
    }
    else {
        leftText.left = rect.left - leftOffset;
        leftText.top = rect.top + (rect.getScaledHeight()/2);

        bottomLeftLine.left = rect.left;
        bottomLeftLine.top = topText.top + topText.getScaledHeight()/4;

        bottomRightLine.top = topText.top + topText.getScaledHeight()/4;
        bottomRightLine.left = topText.left + topText.getScaledWidth() + (topText.getScaledWidth() * 0.1);

        bottomRightDashedLine.left = rect.left;
        bottomRightDashedLine.top  =  topText.top - (topText.getScaledHeight()/4.8);

        leftNodeDash.left = rect.left-1;
        leftNodeDash.top = rightNodeDash.top =  topText.top - (topText.getScaledHeight()/2);

        rightNodeDash.left = rect.left + objScaledWidth;

        leftTopLine.left = leftText.left - 5;
        leftTopLine.top = rect.top;
        leftBottomLine.left  = leftText.left - 5;
        leftBottomLine.top = leftText.top + (leftText.getScaledWidth()/2);
    }



    tempCanvas.requestRenderAll();
  }
  const setObjectDimensions1 =(rect)=>{
    if (!rect) return;
    let tempObjs = tempCanvas._objects;
    let leftSide;
    let rightSide;
    let rightSideInd = -1;
    let leftSideInd = -1;

    if (rect.side === "left"){
      leftSide = rect;
      rightSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "right")
    }else {
      rightSide = rect;
      leftSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "left")
    }
    if (leftSideInd > -1) leftSide = tempObjs[leftSideInd];
    if (rightSideInd > -1) rightSide = tempObjs[rightSideInd]

    const LEFTSIDEWIDTH = leftSide.left + leftSide.getScaledWidth()
    const offsetBetween = 4;


    let fullLineTextInd;
    if (rightSide){
      fullLineTextInd = tempObjs.findIndex(f=>f.name === 'full_line_text' && f.id.includes(rightSide.id));
      if (LEFTSIDEWIDTH === rightSide.left || (LEFTSIDEWIDTH > rightSide.left - offsetBetween && LEFTSIDEWIDTH < rightSide.left + offsetBetween))
        hideNshowCommonLine(rightSide,'show');
      else hideNshowCommonLine(rightSide);
    }
    let bottomTextInd = tempObjs.findIndex(f=>f.name === 'iText' && f.id === rect.id);
    let leftTextInd = tempObjs.findIndex(f=>f.name === 'iTextH' && f.id === rect.id);
    let bottomLeftLineInd = tempObjs.findIndex(f=>f.name === 'bottom_left_line' && f.id === rect.id);
    let bottomRightLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_line' && f.id === rect.id);
    let leftTopLineInd = tempObjs.findIndex(f=>f.name === 'left_top_line' && f.id === rect.id);
    let leftBottomLineInd = tempObjs.findIndex(f=>f.name === 'left_bottom_line' && f.id === rect.id);

    let bottomRightDashedLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_dashed_line' && f.id === rect.id);
    let leftNodeDashInd = tempObjs.findIndex(f=>f.name === 'leftNodeDash' && f.id === rect.id);
    let rightNodeDashInd = tempObjs.findIndex(f=>f.name === 'rightNodeDasn' && f.id === rect.id);


    if (bottomTextInd === -1 || leftTextInd === -1 || bottomLeftLineInd === -1 || bottomRightLineInd === -1|| leftTopLineInd === -1|| leftBottomLineInd === -1 || bottomRightDashedLineInd === -1 || leftNodeDashInd === -1 || rightNodeDashInd === -1) return;;
    let bottomText = tempObjs[bottomTextInd];
    let leftText = tempObjs[leftTextInd];
    let bottomLeftLine = tempObjs[bottomLeftLineInd];
    let bottomRightLine = tempObjs[bottomRightLineInd];
    let leftTopLine = tempObjs[leftTopLineInd];
    let leftBottomLine = tempObjs[leftBottomLineInd];
    let bottomRightDashedLine = tempObjs[bottomRightDashedLineInd];
    let leftNodeDash = tempObjs[leftNodeDashInd];
    let rightNodeDash = tempObjs[rightNodeDashInd];

    let objScaledWidth = rect.getScaledWidth();
    let objScaledHeight = rect.getScaledHeight();
    const bottomOffset = 10;
    const leftOffset = 20;
    bottomText.top = (rect.top + objScaledHeight) + bottomOffset;
    bottomText.left = rect.left + (objScaledWidth/2) - (bottomText.getScaledWidth()/2);

    let fullLineText;

    if (fullLineTextInd > -1) fullLineText = tempObjs[fullLineTextInd];

    if (rightSide && fullLineText){
      fullLineText.left =  rightSide.left - (fullLineText.getScaledWidth()/2);
      fullLineText.top = bottomText.top + (bottomText.getScaledHeight() * 0.78);
    }
    if (rect.side === "right"){
      leftText.left = (rect.left + rect.getScaledWidth()) + leftOffset;
      leftText.top =  rect.top + (objScaledHeight/2);
    }else {
      leftText.left = rect.left - leftOffset;
      leftText.top =  rect.top + (objScaledHeight/2);
    }



    //ADJUST LINES

    let bottomLeftPath =  reInitPath([
      ['M', rect.left, bottomText.top + bottomText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (bottomText.getScaledWidth()/2) - (bottomText.getScaledWidth() * 0.1), 0],
      ['M',rect.left, bottomText.top + (bottomText.getScaledHeight()/4)],
      ['l',0, bottomText.getScaledHeight()/2 ]
    ],{
      stroke : bottomLeftLine.stroke,
      strokeWidth : bottomLeftLine.strokeWidth,
      fill : bottomLeftLine.fill,
      hasBorders : bottomLeftLine.hasBorders,
      id : bottomLeftLine.id,
      hasControls : bottomLeftLine.hasControls,
      name : bottomLeftLine.name},bottomLeftLine);

    let bottomRightPath =  reInitPath([
      ['M', bottomText.left + bottomText.getScaledWidth() + (bottomText.getScaledWidth() * 0.1), bottomText.top + bottomText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (bottomText.getScaledWidth()/2) - (bottomText.getScaledWidth() * 0.1), 0],
      ['M',rect.left + rect.getScaledWidth(), bottomText.top + (bottomText.getScaledHeight()/4)],
      ['l',0, bottomText.getScaledHeight()/2 ]
    ],{
      stroke : bottomRightLine.stroke,
      strokeWidth : bottomRightLine.strokeWidth,
      fill : bottomRightLine.fill,
      hasBorders : bottomRightLine.hasBorders,
      id : bottomRightLine.id,
      hasControls : bottomRightLine.hasControls,
      name : bottomRightLine.name},bottomRightLine);

    let leftTopPath =  reInitPath([
      ['M', leftText.left, rect.top],
      ['l', 0, (rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) -(leftText.getScaledWidth() * 0.1)],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke : leftTopLine.stroke,
      strokeWidth : leftTopLine.strokeWidth,
      fill : leftTopLine.fill,
      hasBorders : leftTopLine.hasBorders,
      id : leftTopLine.id,
      hasControls : leftTopLine.hasControls,
      name : leftTopLine.name},leftTopLine);

    let leftBottomPath =  reInitPath([
      ['M', leftText.left, rect.top + rect.getScaledHeight()],
      ['l', 0, - ((rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) - (leftText.getScaledWidth() * 0.1)) ],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top + rect.getScaledHeight()],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke : leftBottomLine.stroke,
      strokeWidth : leftBottomLine.strokeWidth,
      fill : leftBottomLine.fill,
      hasBorders : leftBottomLine.hasBorders,
      id : leftBottomLine.id,
      hasControls : leftBottomLine.hasControls,
      name : leftBottomLine.name},leftBottomLine);

    let bottomRightDashedPath =  reInitPath([
      ['M', rect.left, bottomText.top + bottomText.getScaledHeight() * 2],
      ['l', rect.getScaledWidth(), 0],
    ],{
      stroke : bottomRightDashedLine.stroke,
      strokeWidth : bottomRightDashedLine.strokeWidth,
      fill : bottomRightDashedLine.fill,
      hasBorders : bottomRightDashedLine.hasBorders,
      id : bottomRightDashedLine.id,
      hasControls : bottomRightDashedLine.hasControls,
      name : bottomRightDashedLine.name},bottomRightDashedLine);
    bottomRightDashedPath.set({ strokeDashArray: [5, 5] })

    let leftNodeDashPath =  reInitPath([
      ['M', rect.left, bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight() * 0.68)],
      ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.1)],
    ],{
      stroke : leftNodeDash.stroke,
      strokeWidth : leftNodeDash.strokeWidth,
      fill : leftNodeDash.fill,
      hasBorders : leftNodeDash.hasBorders,
      id : leftNodeDash.id,
      hasControls : leftNodeDash.hasControls,
      name : leftNodeDash.name},leftNodeDash);
    let rightNodeDashPath =  reInitPath([
      ['M', rect.left + rect.getScaledWidth(), bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight() * 0.68)],
      ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.1)],
    ],{
      stroke : rightNodeDash.stroke,
      strokeWidth : rightNodeDash.strokeWidth,
      fill : rightNodeDash.fill,
      hasBorders : rightNodeDash.hasBorders,
      id : rightNodeDash.id,
      hasControls : rightNodeDash.hasControls,
      name : rightNodeDash.name},rightNodeDash);

    //Adding new paths
    bottomLeftPath.setCoords();
    bottomRightPath.setCoords();
    leftTopPath.setCoords();
    leftBottomPath.setCoords();

    tempCanvas.add(bottomLeftPath,bottomRightPath,leftTopPath,leftBottomPath,bottomRightDashedPath,leftNodeDashPath,rightNodeDashPath);

    if(rect.name === 'rect'){
      if(bottomText && leftText){
        bottomText.text = `${Math.trunc(objScaledWidth)}`;
        leftText.text = `${Math.trunc(objScaledHeight)}`;
        if (rightSide && fullLineText){
          if (rect.side === "left") fullLineText.text = `${Math.trunc(rightSide.getScaledWidth() + rect.getScaledWidth())}`;
          else fullLineText.text = `${Math.trunc(leftSide.getScaledWidth() + rect.getScaledWidth())}`;
        }
        tempCanvas.renderAll();
      }
    }
  }
  const setTopWindowPosition =(rect,rangeFlag)=>{
    if (!rect) return;
    let tempObjs = tempCanvas._objects;

    let bottomTextInd = tempObjs.findIndex(f=>f.name === 'topText' && f.id === rect.id);
    let leftTextInd = tempObjs.findIndex(f=>f.name === 'iTextH' && f.id === rect.id);
    let bottomLeftLineInd = tempObjs.findIndex(f=>f.name === 'bottom_left_line' && f.id === rect.id);
    let bottomRightLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_line' && f.id === rect.id);
    let leftTopLineInd = tempObjs.findIndex(f=>f.name === 'left_top_line' && f.id === rect.id);
    let leftBottomLineInd = tempObjs.findIndex(f=>f.name === 'left_bottom_line' && f.id === rect.id);

    let bottomRightDashedLineInd = tempObjs.findIndex(f=>f.name === 'bottom_right_dashed_line' && f.id === rect.id);
    let leftNodeDashInd = tempObjs.findIndex(f=>f.name === 'leftNodeDash' && f.id === rect.id);
    let rightNodeDashInd = tempObjs.findIndex(f=>f.name === 'rightNodeDasn' && f.id === rect.id);


    if (bottomTextInd === -1 || leftTextInd === -1 || bottomLeftLineInd === -1 || bottomRightLineInd === -1|| leftTopLineInd === -1|| leftBottomLineInd === -1 || bottomRightDashedLineInd === -1 || leftNodeDashInd === -1 || rightNodeDashInd === -1) return;;
    let topText = tempObjs[bottomTextInd];
    let leftText = tempObjs[leftTextInd];
    let bottomLeftLine = tempObjs[bottomLeftLineInd];
    let bottomRightLine = tempObjs[bottomRightLineInd];
    let leftTopLine = tempObjs[leftTopLineInd];
    let leftBottomLine = tempObjs[leftBottomLineInd];
    let bottomRightDashedLine = tempObjs[bottomRightDashedLineInd];
    let leftNodeDash = tempObjs[leftNodeDashInd];
    let rightNodeDash = tempObjs[rightNodeDashInd];

    let objScaledWidth = rect.getScaledWidth();
    let objScaledHeight = rect.getScaledHeight();
    const bottomOffset = 10;
    const leftOffset = 20;
    topText.set('top', rect.top - topText.getScaledWidth()/2 - bottomOffset);
    topText.set('left', rect.left + (rect.getScaledWidth()/2) - (topText.getScaledWidth()/2));

    if (rangeFlag && rangeFlag === 'right_top'){
        leftText.set('left', (rect.left + rect.getScaledWidth()) + leftOffset);
        leftText.set('top', rect.top + (rect.getScaledHeight()/2));
    }else{
        leftText.set('left', rect.left - leftOffset);
        leftText.set('top', rect.top + (rect.getScaledHeight()/2));
    }

    //ADJUST LINES

    let bottomLeftPath =  reInitPath([
      ['M', rect.left, topText.top + topText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (topText.getScaledWidth()/2) - (topText.getScaledWidth() * 0.1), 0],
      ['M',rect.left, topText.top + (topText.getScaledHeight()/4)],
      ['l',0, topText.getScaledHeight()/2 ]
    ],{
      stroke : bottomLeftLine.stroke,
      strokeWidth : bottomLeftLine.strokeWidth,
      fill : bottomLeftLine.fill,
      hasBorders : bottomLeftLine.hasBorders,
      id : bottomLeftLine.id,
      hasControls : bottomLeftLine.hasControls,
      name : bottomLeftLine.name},bottomLeftLine);

    let bottomRightPath =  reInitPath([
      ['M', topText.left + topText.getScaledWidth() + (topText.getScaledWidth() * 0.1), topText.top + topText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (topText.getScaledWidth()/2) - (topText.getScaledWidth() * 0.1), 0],
      ['M',rect.left + rect.getScaledWidth(), topText.top + (topText.getScaledHeight()/4)],
      ['l',0, topText.getScaledHeight()/2 ]
    ],{
      stroke : bottomRightLine.stroke,
      strokeWidth : bottomRightLine.strokeWidth,
      fill : bottomRightLine.fill,
      hasBorders : bottomRightLine.hasBorders,
      id : bottomRightLine.id,
      hasControls : bottomRightLine.hasControls,
      name : bottomRightLine.name},bottomRightLine);

    let leftTopPath =  reInitPath([
      ['M', leftText.left, rect.top],
      ['l', 0, (rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) -(leftText.getScaledWidth() * 0.1)],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke : leftTopLine.stroke,
      strokeWidth : leftTopLine.strokeWidth,
      fill : leftTopLine.fill,
      hasBorders : leftTopLine.hasBorders,
      id : leftTopLine.id,
      hasControls : leftTopLine.hasControls,
      name : leftTopLine.name},leftTopLine);

    let leftBottomPath =  reInitPath([
      ['M', leftText.left, rect.top + rect.getScaledHeight()],
      ['l', 0, - ((rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) - (leftText.getScaledWidth() * 0.1)) ],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top + rect.getScaledHeight()],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke : leftBottomLine.stroke,
      strokeWidth : leftBottomLine.strokeWidth,
      fill : leftBottomLine.fill,
      hasBorders : leftBottomLine.hasBorders,
      id : leftBottomLine.id,
      hasControls : leftBottomLine.hasControls,
      name : leftBottomLine.name},leftBottomLine);

    let bottomRightDashedPath =  reInitPath([
      ['M', rect.left, topText.top - (topText.getScaledHeight()/4.8)],
      ['l', rect.getScaledWidth(), 0],
    ],{
      stroke : bottomRightDashedLine.stroke,
      strokeWidth : bottomRightDashedLine.strokeWidth,
      fill : bottomRightDashedLine.fill,
      hasBorders : bottomRightDashedLine.hasBorders,
      id : bottomRightDashedLine.id,
      hasControls : bottomRightDashedLine.hasControls,
      name : bottomRightDashedLine.name},bottomRightDashedLine);
    bottomRightDashedPath.set({ strokeDashArray: [5, 5] })

    let leftNodeDashPath =  reInitPath([
      ['M', rect.left, topText.top - topText.getScaledHeight()/2],
      ['l', 0, topText.getScaledHeight() / 2 + (topText.getScaledHeight() * 0.1)],
    ],{
      stroke : leftNodeDash.stroke,
      strokeWidth : leftNodeDash.strokeWidth,
      fill : leftNodeDash.fill,
      hasBorders : leftNodeDash.hasBorders,
      id : leftNodeDash.id,
      hasControls : leftNodeDash.hasControls,
      name : leftNodeDash.name},leftNodeDash);
    let rightNodeDashPath =  reInitPath([
      ['M', rect.left + rect.getScaledWidth(), topText.top - (topText.getScaledHeight()/2)],
      ['l', 0, topText.getScaledHeight() / 2 + (topText.getScaledHeight() * 0.1)],
    ],{
      stroke : rightNodeDash.stroke,
      strokeWidth : rightNodeDash.strokeWidth,
      fill : rightNodeDash.fill,
      hasBorders : rightNodeDash.hasBorders,
      id : rightNodeDash.id,
      hasControls : rightNodeDash.hasControls,
      name : rightNodeDash.name},rightNodeDash);

    tempCanvas.add(bottomLeftPath,bottomRightPath,leftTopPath,leftBottomPath,bottomRightDashedPath,leftNodeDashPath,rightNodeDashPath);

    if(rect.name === 'rect'){
      if(topText && leftText){
        topText.text = `${Math.trunc(objScaledWidth)}`;
        leftText.text = `${Math.trunc(objScaledHeight)}`;
      }
    }
  }
  const objectRotating = (e)=>{
    if (!e.target) return;
    setObjectDimensions(e.target)
  }
  const objectScaling = (e)=>{
    if (!e.target) return;
    if (e.target.name === 'rect' && e.target.side==='top'){
        const rangeFlag = inHeightRange(e.target);
        setTopWindowPosition(e.target,rangeFlag);
        if (rangeFlag) {
            reAddCommonHeightLine(e.target,rangeFlag);
        }
    }else {
      setObjectDimensions1(e.target);
      reAddCommonWidthLine(e.target);
    }
  }
  const objectScaled = (e)=>{
    if (!e.target) return;
  }
  const hideNshowCommonLine =(rect,action='hide')=>{
    if (!rect) return;
    let tempObjs = tempCanvas._objects;
    let leftSide;
    let rightSide;
    let rightSideInd = -1;
    let leftSideInd = -1;

    if (rect.side === "left"){
      leftSide = rect;
      rightSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "right")
    }else {
      rightSide = rect;
      leftSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "left")
    }
    if (leftSideInd > -1) leftSide = tempObjs[leftSideInd];
    if (rightSideInd > -1) rightSide = tempObjs[rightSideInd];

    if (!rightSide) return;
    for(let i=0; i< tempCanvas._objects.length; i++){
      if (tempCanvas._objects[i].id.includes(rightSide.id) && ['full_line_text','bottomFullLeftLine','bottomFullRightLine','leftFullNode','rightFullNode'].includes(tempCanvas._objects[i].name)){
        if (action === 'hide') tempCanvas._objects[i].set({opacity: 0});
        else tempCanvas._objects[i].set({opacity: 1});
      }
    }
    tempCanvas.requestRenderAll();
  }
  const movingObject = (e)=>{
    if (!e.target) return;
      removeOldRectObjs();
      hideNshowCommonLine(e.target);
    setObjectDimensions(e.target)
  }
  const selectionCreated = (e)=>{
    if (!e.target) return;
    if(e.selected.length === 1){
      iLeft = e.selected[0].left;
      iTop = e.selected[0].top;
      tempWidth = e.selected[0].getScaledWidth();
      tempHeight = e.selected[0].getScaledHeight();
    }
  }
  const selectionUpdated = (e)=>{
    if(e.selected.length === 1){
      iLeft = e.selected[0].left;
      iTop = e.selected[0].top;
      tempWidth = e.selected[0].width;
      tempHeight = e.selected[0].height;
    }
  }
  const isInRange1 = (value1, value2) => {
    var aligningLineMargin = 4;

    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
      if (i === value2) {
        return true;
      }
    }
    return false;
  }
  const reAddCommonWidthLine =(rect)=>{
    let tempObjs = tempCanvas._objects;
    let leftSide;
    let rightSide;
    let rightSideInd = -1;
    let leftSideInd = -1;

    if (rect.side === 'top') return;

    if (rect.side === "left"){
      leftSide = rect;
      rightSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "right")
    }else {
      rightSide = rect;
      leftSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "left")
    }
    if (leftSideInd > -1) leftSide = tempObjs[leftSideInd];

    if (rightSideInd > -1) rightSide = tempObjs[rightSideInd]

    if (!rightSide) return;
    const LEFTSIDEWIDTH = leftSide.left + leftSide.getScaledWidth()
    const offsetBetween = 4;

    if (LEFTSIDEWIDTH === rightSide.left || (LEFTSIDEWIDTH > rightSide.left - offsetBetween && LEFTSIDEWIDTH < rightSide.left + offsetBetween)){

    // if (isInRange1(leftSide.left + (leftSide.getScaledWidth() / 2), rightSide.left - rightSide.getScaledWidth() / 2) || isInRange1(leftSide.left - (leftSide.getScaledWidth() / 2), rightSide.left + rightSide.getScaledWidth() / 2)){
      let bottomTextInd = tempObjs.findIndex(f=>f.name === 'iText' && f.id === rect.id);
      let leftTextInd = tempObjs.findIndex(f=>f.name === 'iTextH' && f.id === rect.id);

      //is right side exist

      let fullLineTextInd,bottomFullLeftLineInd,bottomFullRightLineInd,lNodeInd,rNodeInd;
      if (rightSide){
        // rightSide.set('left',leftSide.left + leftSide.getScaledWidth() - offsetBetween)
        fullLineTextInd = tempObjs.findIndex(f=>f.name === 'full_line_text' && f.id.includes(rect.id));
        bottomFullLeftLineInd = tempObjs.findIndex(f=>f.name === 'bottomFullLeftLine' && f.id.includes(rect.id));
        bottomFullRightLineInd = tempObjs.findIndex(f=>f.name === 'bottomFullRightLine' && f.id.includes(rect.id));
        lNodeInd = tempObjs.findIndex(f=>f.name === 'leftFullNode' && f.id.includes(rect.id));
        rNodeInd = tempObjs.findIndex(f=>f.name === 'rightFullNode' && f.id.includes(rect.id));
      }

      if (bottomTextInd === -1 || leftTextInd === -1) return;
      let bottomText = tempObjs[bottomTextInd];
      let leftText = tempObjs[leftTextInd];

      let objScaledWidth = rect.getScaledWidth();
      let objScaledHeight = rect.getScaledHeight();
      const bottomOffset = 10;
      const leftOffset = 20;
      bottomText.top = (rect.top + objScaledHeight) + bottomOffset;
      bottomText.left = rect.left + (objScaledWidth/2) - (bottomText.getScaledWidth()/2);

      let fullLineText;

      if (fullLineTextInd > -1) fullLineText = tempObjs[fullLineTextInd];

      if (rightSide && fullLineText){
        fullLineText.left =  rightSide.left - (fullLineText.getScaledWidth()/2);
        fullLineText.top = bottomText.top + (bottomText.getScaledHeight() * 0.78);
      }
      if (rect.side === "right"){
        leftText.left = (rect.left + rect.getScaledWidth()) + leftOffset;
        leftText.top =  rect.top + (objScaledHeight/2);
      }else {
        leftText.left = rect.left - leftOffset;
        leftText.top =  rect.top + (objScaledHeight/2);
      }

      // COMMON LINE
      if (rightSide && leftSide && fullLineTextInd > -1 && bottomFullLeftLineInd > -1 && bottomFullRightLineInd > -1 && lNodeInd > -1 && rNodeInd > -1){
        let fullLineText = tempObjs[fullLineTextInd];
        let bottomFullLeftLine = tempObjs[bottomFullLeftLineInd];
        let bottomFullRightLine = tempObjs[bottomFullRightLineInd];
        let lNode = tempObjs[lNodeInd];
        let rNode = tempObjs[rNodeInd];
        let bottomFullLeftPath =  reInitPath([
          ['M', leftSide.left, bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight()/4)],
          ['l', leftSide.getScaledWidth() - (fullLineText.getScaledWidth()/2) - (fullLineText.getScaledWidth() * 0.1), 0],
        ],{
          stroke : bottomFullLeftLine.stroke,
          strokeWidth : bottomFullLeftLine.strokeWidth,
          fill : bottomFullLeftLine.fill,
          hasBorders : bottomFullLeftLine.hasBorders,
          id : bottomFullLeftLine.id,
          hasControls : bottomFullLeftLine.hasControls,
          name : bottomFullLeftLine.name},bottomFullLeftLine);

        let bottomFullRightPath =  reInitPath([
          ['M', fullLineText.left + fullLineText.getScaledWidth() + (fullLineText.getScaledWidth() * 0.1), bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight()/4)],
          ['l', rightSide.getScaledWidth() - (fullLineText.getScaledWidth()/2) - (fullLineText.getScaledWidth() * 0.1), 0],
        ],{
          stroke : bottomFullRightLine.stroke,
          strokeWidth : bottomFullRightLine.strokeWidth,
          fill : bottomFullRightLine.fill,
          hasBorders : bottomFullRightLine.hasBorders,
          id : bottomFullRightLine.id,
          hasControls : bottomFullRightLine.hasControls,
          name : bottomFullRightLine.name},bottomFullRightLine);

        let lNodePath =  reInitPath([
          ['M', leftSide.left, bottomText.top + bottomText.getScaledHeight()/2 + (bottomText.getScaledHeight() * 0.45)],
          ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06)],
        ],{
          stroke : lNode.stroke,
          strokeWidth : lNode.strokeWidth,
          fill : lNode.fill,
          hasBorders : lNode.hasBorders,
          id : lNode.id,
          hasControls : lNode.hasControls,
          name : lNode.name},lNode);

        let rNodePath =  reInitPath([
          ['M', rightSide.left + rightSide.getScaledWidth(), bottomText.top + bottomText.getScaledHeight()/2 + (bottomText.getScaledHeight() * 0.45)],
          ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06)],
        ],{
          stroke : rNode.stroke,
          strokeWidth : rNode.strokeWidth,
          fill : rNode.fill,
          hasBorders : rNode.hasBorders,
          id : rNode.id,
          hasControls : rNode.hasControls,
          name : rNode.name},rNode);

        tempCanvas.add(bottomFullLeftPath,bottomFullRightPath,lNodePath,rNodePath)
      }

      if (rightSide && fullLineText){
        if (rect.side === "left") fullLineText.text = `${Math.trunc(rightSide.getScaledWidth() + rect.getScaledWidth())}`;
        else fullLineText.text = `${Math.trunc(leftSide.getScaledWidth() + rect.getScaledWidth())}`;
      }
      hideNshowCommonLine(rightSide,'show');
      tempCanvas.requestRenderAll();
    }

  }

  const removeOldRectObjs =(topSide)=>{
      if (!topSide) topSide = tempCanvas._objects.find(o=>o.name ==='rect' && o.side === 'top')
      if (!topSide) return;
      for(let i=0; i< tempCanvas._objects.length; i++){
          if (tempCanvas._objects[i].id === topSide.id && ['full_line_text','leftFullTopLine','leftFullBottomLine','bottomFullNode','topFullNode'].includes(tempCanvas._objects[i].name)){
              tempCanvas.remove(tempCanvas._objects[i]);
          }
      }
      tempCanvas.requestRenderAll();
  }
  const reAddCommonHeightLine =(rect,rangeFlag)=> {
      let tempObjs = tempCanvas._objects;
      const leftSideInd = tempObjs.findIndex(o => o.name === "rect" && o.side === "left")
      const rightSideInd = tempObjs.findIndex(o => o.name === "rect" && o.side === "right")
      const topSideInd = tempObjs.findIndex(o => o.name === "rect" && o.side === "top")
      const bottomOffset = 10;
      const leftOffset = 20;
      if (rangeFlag === 'left_top') {
          if (leftSideInd > -1 && topSideInd > -1){
              let leftSide = tempObjs[leftSideInd];
              let topSide = tempObjs[topSideInd];
              let bottomTextInd = tempObjs.findIndex(f => f.name === 'topText' && f.id === topSide.id);
              let leftTextInd = tempObjs.findIndex(f => f.name === 'iTextH' && f.id === topSide.id);
              let bottomText = tempObjs[bottomTextInd];
              let leftText = tempObjs[leftTextInd];

              leftText.set('left', topSide.left - leftOffset);
              leftText.set('top', topSide.top + (topSide.getScaledHeight()/2));


              for(let i=0; i< tempCanvas._objects.length; i++){
                if (tempCanvas._objects[i].id === topSide.id && ['full_line_text','leftFullTopLine','leftFullBottomLine','bottomFullNode','topFullNode'].includes(tempCanvas._objects[i].name)){
                  tempCanvas.remove(tempCanvas._objects[i]);
                }
              }
              //common height text
              let fullLineText = new fabric.IText(`${Math.trunc(leftSide.getScaledHeight() + topSide.getScaledHeight())}`, {
                  fontFamily: 'Courier New',
                  name: 'full_line_text',
                  fontSize: 14,
                  fontWeight: 700,
                  evented:false,
                  selectable:false,
                  originX:'center',
                  originY:'center',
                  fill: '#000000',
                  id:topSide.id,
                  angle:-90,
                  objecttype:'text',
              });
              tempCanvas.add(fullLineText);
              fullLineText.set('left', leftText.left - leftText.getScaledWidth());
              fullLineText.set('top', topSide.top + topSide.getScaledHeight());
              fullLineText.set('text', `${Math.trunc(leftSide.getScaledHeight() + topSide.getScaledHeight())}`);

              let leftFullTopLine = reInitPath([
                  ['M', fullLineText.left, topSide.top],
                  ['l', 0, topSide.getScaledHeight() - (fullLineText.getScaledWidth()/2) - 3 ],
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,

                  hasControls: false,
                  name: "leftFullTopLine",
              })
              let leftFullBottomLine = reInitPath([
                  ['M', fullLineText.left, fullLineText.top + (fullLineText.getScaledWidth()/2) + 3],
                  ['l', 0, leftSide.getScaledHeight() - (fullLineText.getScaledWidth()/2) - 3 ],
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,

                  hasControls: false,
                  name: "leftFullBottomLine",
              })
              let lNode = reInitPath([
                  ['M', fullLineText.left - fullLineText.getScaledWidth()/5.4, leftSide.top + leftSide.getScaledHeight()],
                  ['l', bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06),0 ],
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,
                  hasControls: false,
                  name: "bottomFullNode",
              })
              let rNode = reInitPath([
                  ['M', fullLineText.left - fullLineText.getScaledWidth()/5.4, topSide.top],
                  ['l', bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06),0 ]
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,

                  hasControls: false,
                  name: "topFullNode",
              })
              tempCanvas.add(leftFullTopLine,leftFullBottomLine,lNode,rNode)
              tempCanvas.requestRenderAll();
              }
      } else if (rangeFlag === 'right_top') {
          if (rightSideInd > -1 && topSideInd > -1){
              let rightSide = tempObjs[rightSideInd];
              let topSide = tempObjs[topSideInd];
              let bottomTextInd = tempObjs.findIndex(f => f.name === 'topText' && f.id === topSide.id);
              let leftTextInd = tempObjs.findIndex(f => f.name === 'iTextH' && f.id === topSide.id);
              let bottomText = tempObjs[bottomTextInd];
              let leftText = tempObjs[leftTextInd];

              leftText.set('left', (topSide.left + topSide.getScaledWidth()) + leftOffset);
              leftText.set('top', topSide.top + (topSide.getScaledHeight()/2));

              for(let i=0; i< tempCanvas._objects.length; i++){
                if (tempCanvas._objects[i].id === topSide.id && ['full_line_text','leftFullTopLine','leftFullBottomLine','bottomFullNode','topFullNode'].includes(tempCanvas._objects[i].name)){
                  tempCanvas.remove(tempCanvas._objects[i]);
                }
              }

              //common height text
              let fullLineText = new fabric.IText(`${Math.trunc(rightSide.getScaledHeight() + topSide.getScaledHeight())}`, {
                  fontFamily: 'Courier New',
                  name: 'full_line_text',
                  fontSize: 14,
                  fontWeight: 700,
                  evented:false,
                  selectable:false,
                  originX:'center',
                  originY:'center',
                  fill: '#000000',
                  id:topSide.id,
                  angle:-90,
                  objecttype:'text',
              });
              tempCanvas.add(fullLineText);
              fullLineText.set('left', leftText.left + leftText.getScaledWidth());
              fullLineText.set('top', topSide.top + topSide.getScaledHeight());
              fullLineText.set('text', `${Math.trunc(rightSide.getScaledHeight() + topSide.getScaledHeight())}`);

              let leftFullTopLine = reInitPath([
                  ['M', fullLineText.left, topSide.top],
                  ['l', 0, topSide.getScaledHeight() - (fullLineText.getScaledWidth()/2) - 3 ],
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,

                  hasControls: false,
                  name: "leftFullTopLine",
              })
              let leftFullBottomLine = reInitPath([
                  ['M', fullLineText.left, fullLineText.top + (fullLineText.getScaledWidth()/2) + 3],
                  ['l', 0, rightSide.getScaledHeight() - (fullLineText.getScaledWidth()/2) - 3 ],
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,

                  hasControls: false,
                  name: "leftFullBottomLine",
              })
              let lNode = reInitPath([
                  ['M', fullLineText.left - fullLineText.getScaledWidth()/5.4, rightSide.top + rightSide.getScaledHeight()],
                  ['l', bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06),0 ],
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,
                  hasControls: false,
                  name: "bottomFullNode",
              })
              let rNode = reInitPath([
                  ['M', fullLineText.left - fullLineText.getScaledWidth()/5.4, topSide.top],
                  ['l', bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06),0 ]
              ],{
                  stroke: 'blue',
                  strokeWidth: 2,
                  fill: false,
                  hasBorders: false,
                  evented:false,
                  selectable:false,
                  objectCaching:false,
                  id:topSide.id,

                  hasControls: false,
                  name: "topFullNode",
              })
              tempCanvas.add(leftFullTopLine,leftFullBottomLine,lNode,rNode)
              tempCanvas.requestRenderAll();
              }
      }

  }
  const inHeightRange =()=>{
      let rangeFlag=''
      let tempObjs = tempCanvas._objects;

      const leftSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "left")
      const rightSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "right")
      const topSideInd = tempObjs.findIndex(o=>o.name === "rect" && o.side === "top")

      if (topSideInd > -1 && leftSideInd > -1) {
          let topSide = tempObjs[topSideInd]
          let leftSide = tempObjs[leftSideInd]
          const topSideHeight = topSide.top + topSide.getScaledHeight();
          const leftSideWidth = leftSide.left + leftSide.getScaledWidth();
          const offsetBetween = 4;

          if ((topSideHeight === leftSide.top || (topSideHeight > leftSide.top - offsetBetween && topSideHeight < leftSide.top + offsetBetween)) && topSide.left < leftSideWidth) {
              rangeFlag = 'left_top';
          }else removeOldRectObjs(topSide);
      }
      if (topSideInd > -1 && rightSideInd > -1) {
          let topSide = tempObjs[topSideInd]
          let rightSide = tempObjs[rightSideInd]
          const topSideHeight = topSide.top + topSide.getScaledHeight();
          const rightSideWidth = rightSide.left + rightSide.getScaledWidth();
          const offsetBetween = 4;

          if ((topSideHeight === rightSide.top || (topSideHeight > rightSide.top - offsetBetween && topSideHeight < rightSide.top + offsetBetween)) && topSide.left >= rightSide.left) {
              rangeFlag = 'right_top';
          }else removeOldRectObjs(topSide);
      }
      return rangeFlag;
  }
  const modifiedObject = (e)=>{
    if (!e.target) return;
    let rect = e.target;
    reAddCommonWidthLine(rect)
    const rangeFlag = inHeightRange(rect);
    if (rangeFlag) {
        reAddCommonHeightLine(rect,rangeFlag);
    }
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

  const addRect = (rectSide="left",props) => {
    let w =100;
    let h = 150;
    let left = 200;
    let top = 250;
    if (props){
      left = props.left
      top = props.top
    }
    const unique_id = uuid();
    let rect1 = new fabric.Rect({
      width: w,
      height: h,
      left,
      top,
      fill: "orange",
      borderColor: "red",
      name:'rect-box',
      strokeWidth: 15,
      stroke: "#3F4E4F",
      cornerColor: "red",
      // padding: 15,
      transparentCorners: false,
      id: unique_id,
    });

    rect1.setControlsVisibility({
      mtr: false,
    });
    // setObjArr([...objArr, rect]);
    canvas.add(rect1);
    // canvas.setActiveObject(rect);
    canvas.centerObject(rect1);
    canvas.isDrawingMode = false;

    let rectLines = new fabric.Path([
      ['M', rect1.left, rect1.top],
      ['l', rect1.getScaledHeight() * 0.09, rect1.getScaledWidth() * 0.14],
      ['M', rect1.left + rect1.getScaledWidth(), rect1.top],
      ['l', -rect1.getScaledHeight() * 0.09, rect1.getScaledWidth() * 0.14],
      ['M', rect1.left, rect1.top + rect1.getScaledHeight()],
      ['l', rect1.getScaledHeight() * 0.09, -rect1.getScaledWidth() * 0.14],
      ['M', rect1.left + rect1.getScaledWidth(), rect1.top + rect1.getScaledHeight()],
      ['l', -rect1.getScaledHeight() * 0.09, -rect1.getScaledWidth() * 0.14],

    ], {
      stroke: 'orange',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented: false,
      selectable: false,
      id: unique_id,
      hasControls: false,
      name: "rect_internal_lines",
    });
    const rect = new fabric.Group([rect1,rectLines], {
      // originX: 'center',
      // originY: 'center',
      left,
      top,
      name: "rect",
      side:rectSide,
      perPixelTargetFind: true,
      id: unique_id,
    });
    rect.setControlsVisibility({
      mtr: false,
    });
    canvas.remove(rect1)
    canvas.add(rect)

    canvas.setActiveObject(rect);
    // canvas.centerObject(rect1);
    let leftText = new fabric.IText(`${h}`, {
      fontFamily: 'Courier New',
      name: 'iTextH',
      fontSize: 14,
      fill: '#000000',
      fontWeight: 700,
      evented:false,
      selectable:false,
      originX:'center',
      originY:'center',
      id:unique_id,
      objecttype:'text',
      angle:-90
    });
    canvas.add(leftText);

    let bottomText = new fabric.IText(`${w}`, {
      fontFamily: 'Courier New',
      name: 'iText',
      fontSize: 14,
      fontWeight: 700,
      evented:false,
      selectable:false,
      fill: '#000000',
      id:unique_id,
      objecttype:'text',
    });
    canvas.add(bottomText);

    const bottomOffset = 10;
    const leftOffset = 20;
    bottomText.set('top', (rect.top + rect.getScaledHeight()) + bottomOffset);
    bottomText.set('left', rect.left + (rect.getScaledWidth()/2) - (bottomText.getScaledWidth()/2));
    let fullLineText = new fabric.IText(`${w}`, {
      fontFamily: 'Courier New',
      name: 'full_line_text',
      fontSize: 14,
      fontWeight: 700,
      evented:false,
      selectable:false,
      fill: '#000000',
      id:unique_id,
      objecttype:'text',
    });
    if (rectSide === "right"){
      canvas.add(fullLineText);
      let leftSide = canvas._objects.find(o=>o.name === "rect" && o.side === "left")
      leftText.set('left', (rect.left + rect.getScaledWidth()) + leftOffset);
      leftText.set('top', rect.top + (rect.getScaledHeight()/2));
      fullLineText.set('left', rect.left - (fullLineText.getScaledWidth()/2));
      fullLineText.set('top', bottomText.top + (bottomText.getScaledHeight() * 0.78));
      if (leftSide){
        fullLineText.set('id', `${leftSide.id}::${unique_id}`);
        // rect.set('id', `${leftSide.id}::${unique_id}`);
        fullLineText.set('text', `${Math.trunc(leftSide.getScaledWidth() + rect.getScaledWidth())}`);
      }


    }else {
      leftText.set('left', rect.left - leftOffset);
      leftText.set('top', rect.top + (rect.getScaledHeight()/2));
    }




    //ADDING PATHS
    let bottomLeftLine = reInitPath([
      ['M', rect.left, bottomText.top + bottomText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (bottomText.getScaledWidth()/2) - (bottomText.getScaledWidth() * 0.1), 0],
      ['M',rect.left, bottomText.top + (bottomText.getScaledHeight()/4)],
      ['l',0, bottomText.getScaledHeight()/2 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "bottom_left_line",
    })

    let bottomRightLine = reInitPath([
      ['M', bottomText.left + bottomText.getScaledWidth() + (bottomText.getScaledWidth() * 0.1), bottomText.top + bottomText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (bottomText.getScaledWidth()/2) - (bottomText.getScaledWidth() * 0.1), 0],
      ['M',rect.left + rect.getScaledWidth(), bottomText.top + (bottomText.getScaledHeight()/4)],
      ['l',0, bottomText.getScaledHeight()/2 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "bottom_right_line",
    })

    if (rectSide === "right"){
      let leftSide = canvas._objects.find(o=>o.name === "rect" && o.side === "left")
      if (leftSide){
        let bottomFullLeftLine = reInitPath([
          ['M', leftSide.left, bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight()/4)],
          ['l', leftSide.getScaledWidth() - (fullLineText.getScaledWidth()/2) - (fullLineText.getScaledWidth() * 0.1), 0],
        ],{
          stroke: 'blue',
          strokeWidth: 2,
          fill: false,
          hasBorders: false,
          evented:false,
          selectable:false,
          objectCaching:false,
          id:`${leftSide.id}::${unique_id}`,

          hasControls: false,
          name: "bottomFullLeftLine",
        })
        let bottomFullRightLine = reInitPath([
          ['M', fullLineText.left + fullLineText.getScaledWidth() + (fullLineText.getScaledWidth() * 0.1), bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight()/4)],
          ['l', leftSide.getScaledWidth() - (fullLineText.getScaledWidth()/2) - (fullLineText.getScaledWidth() * 0.1), 0],
        ],{
          stroke: 'blue',
          strokeWidth: 2,
          fill: false,
          hasBorders: false,
          evented:false,
          selectable:false,
          objectCaching:false,
          id:`${leftSide.id}::${unique_id}`,

          hasControls: false,
          name: "bottomFullRightLine",
        })
        let lNode = reInitPath([
          ['M', leftSide.left, bottomText.top + bottomText.getScaledHeight()/2 + (bottomText.getScaledHeight() * 0.45)],
          ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06)],
        ],{
          stroke: 'blue',
          strokeWidth: 2,
          fill: false,
          hasBorders: false,
          evented:false,
          selectable:false,
          objectCaching:false,
          id:`${leftSide.id}::${unique_id}`,
          hasControls: false,
          name: "leftFullNode",
        })
        let rNode = reInitPath([
          ['M', rect.left + rect.getScaledWidth(), bottomText.top + bottomText.getScaledHeight()/2 + (bottomText.getScaledHeight() * 0.45)],
          ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.06)],
        ],{
          stroke: 'blue',
          strokeWidth: 2,
          fill: false,
          hasBorders: false,
          evented:false,
          selectable:false,
          objectCaching:false,
          id:`${leftSide.id}::${unique_id}`,

          hasControls: false,
          name: "rightFullNode",
        })
        canvas.add(bottomFullLeftLine,bottomFullRightLine,lNode,rNode)
      }
    }

    let bottomRightDashedLine = reInitPath([
      ['M', rect.left, bottomText.top + bottomText.getScaledHeight() * 2],
      ['l', rect.getScaledWidth(), 0],
    ],{
      stroke: 'blue',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      objectCaching:false,
      id:unique_id,
      hasControls: false,
      name: "bottom_right_dashed_line",
    })
    let leftNodeDash = reInitPath([
      ['M', rect.left, bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight() * 0.68)],
      ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.1)],
    ],{
      stroke: 'blue',
      strokeWidth: 4,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      objectCaching:false,
      id:unique_id,
      hasControls: false,
      name: "leftNodeDash",
    })
    let rightNodeDash = reInitPath([
      ['M', rect.left + rect.getScaledWidth(), bottomText.top + bottomText.getScaledHeight() + (bottomText.getScaledHeight() * 0.68)],
      ['l', 0, bottomText.getScaledHeight() / 2 + (bottomText.getScaledHeight() * 0.1)],
    ],{
      stroke: 'blue',
      strokeWidth: 4,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      objectCaching:false,
      id:unique_id,
      hasControls: false,
      name: "rightNodeDasn",
    })
    bottomRightDashedLine.set({ strokeDashArray: [5, 5] })

    let leftTopLine = reInitPath([
      ['M', leftText.left, rect.top],
      ['l', 0, (rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) -(leftText.getScaledWidth() * 0.1)],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "left_top_line",
    })
    let leftBottomLine = reInitPath([
      ['M', leftText.left, rect.top + rect.getScaledHeight()],
      ['l', 0, - ((rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) - (leftText.getScaledWidth() * 0.1)) ],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top + rect.getScaledHeight()],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "left_bottom_line",
    })
    canvas.add(bottomLeftLine,bottomRightLine,leftTopLine,leftBottomLine,bottomRightDashedLine,leftNodeDash,rightNodeDash)
    canvas.discardActiveObject();
    canvas.setActiveObject(rect);
    canvas.renderAll();
    if (rectSide === "left") addRect('right',{
      left: rect.left + rect.getScaledWidth(),
      top: rect.top,
    })
  };
  const addTopWindow = () => {
    let w =215;
    let h = 100;
    let left = 200;
    let top = 100;
    const unique_id = uuid();
    let rect1 = new fabric.Rect({
      width: w,
      height: h,
      left,
      top,
      borderColor: "red",
      name:'rect-box',
      strokeWidth: 15,
      fill: "orange",
      stroke: "#3F4E4F",
      cornerColor: "red",
      // padding: 15,
      transparentCorners: false,
      id: unique_id,
    });

    rect1.setControlsVisibility({
      mtr: false,
    });
    // setObjArr([...objArr, rect]);
    canvas.add(rect1);
    // canvas.setActiveObject(rect);
    canvas.centerObject(rect1);
    canvas.isDrawingMode = false;

    let rectLines = new fabric.Path([
      ['M', rect1.left, rect1.top],
      ['l', rect1.getScaledHeight() * 0.14, rect1.getScaledWidth() * 0.07],
      ['M', rect1.left + rect1.getScaledWidth(), rect1.top],
      ['l', -rect1.getScaledHeight() * 0.14, rect1.getScaledWidth() * 0.07],
      ['M', rect1.left, rect1.top + rect1.getScaledHeight()],
      ['l', rect1.getScaledHeight() * 0.14, -rect1.getScaledWidth() * 0.07],
      ['M', rect1.left + rect1.getScaledWidth(), rect1.top + rect1.getScaledHeight()],
      ['l', -rect1.getScaledHeight() * 0.14, -rect1.getScaledWidth() * 0.07],

    ], {
      stroke: 'orange',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented: false,
      selectable: false,
      id: unique_id,
      hasControls: false,
      name: "rect_internal_lines",
    });
    const rect = new fabric.Group([rect1,rectLines], {
      // originX: 'center',
      // originY: 'center',
      left,
      top,
      name: "rect",
      perPixelTargetFind: true,
      id: unique_id,
    });
    rect.set('side','top')
    rect.setControlsVisibility({
      mtr: false,
    });
    canvas.remove(rect1)
    canvas.add(rect)

    canvas.setActiveObject(rect);
    // canvas.centerObject(rect1);
    let leftText = new fabric.IText(`${h}`, {
      fontFamily: 'Courier New',
      name: 'iTextH',
      fontSize: 14,
      fill: '#000000',
      fontWeight: 700,
      evented:false,
      selectable:false,
      originX:'center',
      originY:'center',
      id:unique_id,
      objecttype:'text',
      angle:-90
    });
    canvas.add(leftText);

    let topText = new fabric.IText(`${w}`, {
      fontFamily: 'Courier New',
      name: 'topText',
      fontSize: 14,
      fontWeight: 700,
      evented:false,
      selectable:false,
      fill: '#000000',
      id:unique_id,
      objecttype:'text',
    });
    canvas.add(topText);

    const bottomOffset = 10;
    const leftOffset = 20;
    topText.set('top', rect.top - topText.getScaledWidth()/2 - bottomOffset);
    topText.set('left', rect.left + (rect.getScaledWidth()/2) - (topText.getScaledWidth()/2));

      leftText.set('left', rect.left - leftOffset);
      leftText.set('top', rect.top + (rect.getScaledHeight()/2));




    //ADDING PATHS
    let bottomLeftLine = reInitPath([
      ['M', rect.left, topText.top + topText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (topText.getScaledWidth()/2) - (topText.getScaledWidth() * 0.1), 0],
      ['M',rect.left, topText.top + (topText.getScaledHeight()/4)],
      ['l',0, topText.getScaledHeight()/2 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "bottom_left_line",
    })

    let bottomRightLine = reInitPath([
      ['M', topText.left + topText.getScaledWidth() + (topText.getScaledWidth() * 0.1), topText.top + topText.getScaledHeight()/2],
      ['l', (rect.getScaledWidth()/2) - (topText.getScaledWidth()/2) - (topText.getScaledWidth() * 0.1), 0],
      ['M',rect.left + rect.getScaledWidth(), topText.top + (topText.getScaledHeight()/4)],
      ['l',0, topText.getScaledHeight()/2 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "bottom_right_line",
    })


    let bottomRightDashedLine = reInitPath([
      ['M', rect.left, topText.top - (topText.getScaledHeight()/4.8)],
      ['l', rect.getScaledWidth(), 0],
    ],{
      stroke: 'blue',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      objectCaching:false,
      id:unique_id,
      hasControls: false,
      name: "bottom_right_dashed_line",
    })
    let leftNodeDash = reInitPath([
      ['M', rect.left, topText.top - topText.getScaledHeight()/2],
      ['l', 0, topText.getScaledHeight() / 2 + (topText.getScaledHeight() * 0.1)],
    ],{
      stroke: 'blue',
      strokeWidth: 4,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      objectCaching:false,
      id:unique_id,
      hasControls: false,
      name: "leftNodeDash",
    })
    let rightNodeDash = reInitPath([
      ['M', rect.left + rect.getScaledWidth(), topText.top - (topText.getScaledHeight()/2)],
      ['l', 0, topText.getScaledHeight() / 2 + (topText.getScaledHeight() * 0.1)],
    ],{
      stroke: 'blue',
      strokeWidth: 4,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      objectCaching:false,
      id:unique_id,
      hasControls: false,
      name: "rightNodeDasn",
    })
    bottomRightDashedLine.set({ strokeDashArray: [5, 5] })

    let leftTopLine = reInitPath([
      ['M', leftText.left, rect.top],
      ['l', 0, (rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) -(leftText.getScaledWidth() * 0.1)],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "left_top_line",
    })
    let leftBottomLine = reInitPath([
      ['M', leftText.left, rect.top + rect.getScaledHeight()],
      ['l', 0, - ((rect.getScaledHeight()/2) - (leftText.getScaledWidth()/2) - (leftText.getScaledWidth() * 0.1)) ],
      ['M',leftText.left - (leftText.getScaledHeight()/4), rect.top + rect.getScaledHeight()],
      ['l',leftText.getScaledHeight()/2, 0 ]
    ],{
      stroke: 'red',
      strokeWidth: 2,
      fill: false,
      hasBorders: false,
      evented:false,
      selectable:false,
      id:unique_id,
      hasControls: false,
      name: "left_bottom_line",
    })
      // Common height line

      canvas.add(bottomLeftLine,bottomRightLine,leftTopLine,leftBottomLine,bottomRightDashedLine,leftNodeDash,rightNodeDash)
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

  const deleteObject = (rect) => {
    addNewState();

    let target = rect;
    if (!target) target = canvas.getActiveObject();
    if (!target) return;
    if (target.name === 'rect'){
      for(let i=0; i< canvas._objects.length; i++){
        if (canvas._objects[i].id === target.id || canvas._objects[i].id.includes(target.id)){
          canvas.remove(canvas._objects[i])
        }
      }
      canvas.renderAll();
    }
    else {
      canvas.remove(target);
    }
    canvas.requestRenderAll();
  };

  const saveCanvas = () => {
    const img = canvas.toDataURL();
    let link = document.createElement("a");
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

    if(actObj ){
      let cText = canvas._objects.findIndex(f=>f.name === 'iText' && f.id === actObj.id);
      if(cText === -1){
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
                addTopWindow ={addTopWindow}
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