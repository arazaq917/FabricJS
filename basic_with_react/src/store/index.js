import { configureStore } from "@reduxjs/toolkit";
import CanvasSlice from "./CanvasSlice";
const store = configureStore({
  reducer: CanvasSlice.reducer,
});
export default store;
