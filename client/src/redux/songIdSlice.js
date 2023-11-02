import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  songId: 0,
};

export const songIdSlice = createSlice({
  name: "sounds",
  initialState,
  reducers: {
    setSongId: (state, action) => {
      const songId = action.payload;
      return { ...state, songId };
    },
  },
});

export const { setSongId } = songIdSlice.actions;

export default songIdSlice.reducer;
