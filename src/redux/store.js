import { configureStore } from '@reduxjs/toolkit';
import blockSlice from './blockSlice';
import linesSlice from './linesSlice';
import blockCanvasSlice from './blockCanvasSlice';

export const store = configureStore({
    reducer: {
        lines1: linesSlice,
        block: blockSlice,
        canvas: blockCanvasSlice,
    },
});