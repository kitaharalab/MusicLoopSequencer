import { createSlice } from "@reduxjs/toolkit";

const curveLength = 1152;
const curveInitial = 250;
const linesY = new Array(curveLength).fill(curveInitial);
const initialState = {
  lines: linesY,
};

export const linesSlice = createSlice({
  name: "lines",
  initialState,
  reducers: {
    setStart: (state, action) => {
      const { posX, posY } = action.payload;
      state.lines[posX] = posY;
    },
    setDraw: (state, action) => {
      const { posX, posY, offsetX, offsetY } = action.payload;
      state.lines[offsetX] = offsetY;
      const difference = Math.floor(Math.abs(offsetX - posX));
      if (offsetX > posX) {
        for (let i = 1; i < difference; i++) {
          state.lines[posX + i] = Math.floor(
            posY + ((offsetY - posY) * (posX + i - posX)) / (offsetX - posX),
          );
        }
      } else {
        for (let i = 1; i < difference; i++) {
          state.lines[posX - i] = Math.floor(
            posY + ((offsetY - posY) * (posX - i - posX)) / (offsetX - posX),
          );
        }
      }
    },
    setLine: (state, action) => {
      const { lines } = action.payload;

      return {
        ...state,
        lines,
      };
    },
  },
});

export const { setStart, setDraw, setLine } = linesSlice.actions;

export default linesSlice.reducer;
