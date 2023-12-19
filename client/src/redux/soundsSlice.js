import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  parts: [],
  part: null,
  measure: null,
};

export const soundsSlice = createSlice({
  name: "sounds",
  initialState,
  reducers: {
    setParts: (state, action) => {
      state.parts = action.payload;
    },
    setSelectedLoop: (state, action) => {
      const { part, measure } = action.payload;
      return {
        ...state,
        part,
        measure,
      };
    },
  },
});

export const { setParts, setSelectedLoop } = soundsSlice.actions;

export default soundsSlice.reducer;
