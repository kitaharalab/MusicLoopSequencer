import { createSlice } from "@reduxjs/toolkit";

// const curveLength = 1152;
// const curveInitial = 250;
const json = {
  curve: [
    1, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 3, 3, 0, 0, 0,
  ],
  sounds: [
    {
      partid: 0,
      measure: 0,
      soundId: 13,
    },
    {
      partid: 0,
      measure: 1,
      soundId: 100,
    },
  ],
};
const initialState = {
  json,
};

export const soundDataSlice = createSlice({
  name: "json",
  initialState,
  reducers: {
    setJson: (state, action) => {
      const { payload } = action;
      state.json.sounds.push(payload);
      // eslint-disable-next-line prefer-destructuring
      state.json.sounds[0] = state.json.sounds[1];
      // eslint-disable-next-line prefer-destructuring
      state.json.sounds[1] = state.json.sounds[2];
    },
  },
});

export const { setJson } = soundDataSlice.actions;

export default soundDataSlice.reducer;
