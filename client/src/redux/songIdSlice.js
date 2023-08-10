import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  songId: 0,
};

export const songIdSlice = createSlice({
  name: "sounds",
  initialState,
  reducers: {
    setId: (state, action) => {
      state.songId = action.payload;
    },
  },
});

export const { setId } = songIdSlice.actions;

export default songIdSlice.reducer;
