import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  xCoordinate: [],
  yCoordinate: [],
  rangeList: [],
};

export const musicDataSlice = createSlice({
  name: "musicData",
  initialState,
  reducers: {
    setMusicData: (state, action) => {
      const { xCoordinate, yCoordinate, rangeList } = action.payload;
      state.xCoordinate = xCoordinate;
      state.yCoordinate = yCoordinate;
      state.rangeList = rangeList;
    },
  },
});

export const { setMusicData } = musicDataSlice.actions;

export default musicDataSlice.reducer;
