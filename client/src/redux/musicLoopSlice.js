import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    musicLoopId: 0,
}

export const musicLoopSlice = createSlice({
    name: 'Id',
    initialState,
    reducers: {
        setMusicLoopId: (state, action) => {
            state.musicLoopId = action.payload;
        },
    },
});

export const { setMusicLoopId } = musicLoopSlice.actions;

export default musicLoopSlice.reducer;