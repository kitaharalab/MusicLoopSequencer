import { configureStore } from '@reduxjs/toolkit';
import soundsSlice from './soundsSlice';
import linesSlice from './linesSlice';
import blockCanvasSlice from './blockCanvasSlice';

export const store = configureStore({
    reducer: {
        lines1: linesSlice,
        sounds: soundsSlice,
        canvas: blockCanvasSlice,
    },
});