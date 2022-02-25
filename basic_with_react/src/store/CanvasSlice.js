import { createSlice } from "@reduxjs/toolkit";
import { fabric } from "fabric";

const initialState = {
  canvas: "",
};
const CanvasSlice = createSlice({
  name: "canvasSlice",
  initialState: initialState,

  reducers: {
    initCanvas(state, actions) {
      state.canvas = new fabric.Canvas(actions.payload, {
        width: 600,
        height: 600,
        backgroundColor: "#c6c7c5",
      });
      //   state.initialState = actions.payload;
    },
  },
 
});
export const canvasAction = CanvasSlice.actions;
export default CanvasSlice;
