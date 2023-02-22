import { createSlice } from '@reduxjs/toolkit';

const curveLength = 1152;
const curveInitial = 250;
const initialState = {
    posRectX: 0,
    posRectY: 0,
}


export const blockSlice = createSlice({
    name: 'block',
    initialState,
    reducers: {
        setPos: (state, action) => {
            const { offsetX, offsetY } = action.payload;
            state.posRectX = Math.floor(offsetX / 36);
            state.posRectY = Math.floor(offsetY / 50);
        },
    },
});

export const { setPos } = blockSlice.actions;

export default blockSlice.reducer;