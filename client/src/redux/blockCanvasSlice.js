import { createSlice } from "@reduxjs/toolkit";

// const curveLength = 1152;
// const curveInitial = 250;
const initialState = {
  measureId: 0,
  partId: 0,
};

export const blockCanvasSlice = createSlice({
  name: "Ids",
  initialState,
  reducers: {
    setPos: (state, action) => {
      const { offsetX, offsetY } = action.payload;
      state.measureId = Math.floor(offsetX / 36);
      state.partId = Math.floor(offsetY / 50);
    },
  },
});

export const { setPos } = blockCanvasSlice.actions;

export default blockCanvasSlice.reducer;
