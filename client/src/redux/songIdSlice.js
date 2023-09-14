import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  songId: 0,
};

export const songIdSlice = createSlice({
  name: "sounds",
  initialState,
  reducers: {
    setSongId: (state, action) => {
      state.songId = action.payload;
    },
  },
});

export const { setSongId } = songIdSlice.actions;

export default songIdSlice.reducer;
