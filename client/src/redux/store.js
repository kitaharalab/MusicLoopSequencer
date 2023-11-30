import { configureStore } from "@reduxjs/toolkit";

import apiParamSlice from "./apiParamSlice";
import blockCanvasSlice from "./blockCanvasSlice";
import linesSlice from "./linesSlice";
import musicDataSlice from "./musicDataSlice";
import musicLoopSlice from "./musicLoopSlice";
import songIdSlice from "./songIdSlice";
import soundDataSlice from "./soundDataSlice";
import soundsSlice from "./soundsSlice";

export const store = configureStore({
  reducer: {
    lines1: linesSlice,
    sounds: soundsSlice,
    canvas: blockCanvasSlice,
    musicData: musicDataSlice,
    songId: songIdSlice,
    musicLoop: musicLoopSlice,
    soundData: soundDataSlice,
    apiParams: apiParamSlice,
  },
});
