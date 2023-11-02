import { configureStore } from "@reduxjs/toolkit";
import soundsSlice from "./soundsSlice";
import linesSlice from "./linesSlice";
import blockCanvasSlice from "./blockCanvasSlice";
import musicDataSlice from "./musicDataSlice";
import songIdSlice from "./songIdSlice";
import musicLoopSlice from "./musicLoopSlice";
import soundDataSlice from "./soundDataSlice";

export const store = configureStore({
  reducer: {
    lines1: linesSlice,
    sounds: soundsSlice,
    canvas: blockCanvasSlice,
    musicData: musicDataSlice,
    songId: songIdSlice,
    musicLoop: musicLoopSlice,
    soundData: soundDataSlice,
  },
});
