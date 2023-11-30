import { configureStore } from "@reduxjs/toolkit";

import apiParamSlice from "./apiParamSlice";
import linesSlice from "./linesSlice";
import musicDataSlice from "./musicDataSlice";
import soundsSlice from "./soundsSlice";

export const store = configureStore({
  reducer: {
    lines1: linesSlice,
    sounds: soundsSlice,
    musicData: musicDataSlice,
    apiParams: apiParamSlice,
  },
});
