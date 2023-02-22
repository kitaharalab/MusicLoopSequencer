import { createSlice } from '@reduxjs/toolkit';

const curveLength = 1152;
const curveInitial = 250;
const initialState = {
    canvas: null,
}

export const blockCanvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        setCanvas: (state, action) => {
            const canvas = action.payload;
            state.canvas = canvas;
        },
    },
});

export const { setCanvas } = blockCanvasSlice.actions;

export default blockCanvasSlice.reducer;