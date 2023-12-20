import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  parts: [],
  part: null,
  measure: null,
  loopId: null,
};

export const soundsSlice = createSlice({
  name: "sounds",
  initialState,
  reducers: {
    setParts: (state, action) => {
      state.parts = action.payload;
    },
    setSelectedLoop: (state, action) => {
      const { part, measure, loopId } = action.payload;
      state.loopId = loopId;
      state.measure = measure;
      state.part = part;
    },
  },
});

export const { setParts, setSelectedLoop } = soundsSlice.actions;

export default soundsSlice.reducer;
