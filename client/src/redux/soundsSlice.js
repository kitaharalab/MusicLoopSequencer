import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  parts: [],
};

export const soundsSlice = createSlice({
  name: "sounds",
  initialState,
  reducers: {
    setParts: (state, action) => {
      state.parts = action.payload;
    },
  },
});

export const { setParts } = soundsSlice.actions;

export default soundsSlice.reducer;
