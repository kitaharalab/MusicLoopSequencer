import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loopPositions: [],
};

export const musicDataSlice = createSlice({
  name: "musicData",
  initialState,
  reducers: {
    setLoopPositions: (state, action) => {
      const loopPositions = action.payload;
      return {
        ...state,
        loopPositions,
      };
    },
  },
});

export const { setLoopPositions } = musicDataSlice.actions;

export default musicDataSlice.reducer;
