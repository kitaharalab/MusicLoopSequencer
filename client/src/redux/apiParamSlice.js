import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectId: undefined,
  songId: undefined,
  partId: undefined,
  measure: undefined,
  loopId: undefined,
};

export const apiParamSlice = createSlice({
  name: "sounds",
  initialState,
  reducers: {
    setProjectId: (state, action) => {
      state.projectId = action.payload;
    },
    setSongId: (state, action) => {
      state.songId = action.payload;
    },
    setPartId: (state, action) => {
      state.partId = action.payload;
    },
    setMeasure: (state, action) => {
      state.measure = action.payload;
    },
    setLoopId: (state, action) => {
      state.loopId = action.payload;
    },
    setApiParam: (state, action) => {
      const { projectId, songId, partId, measure, loopId } = action.payload;
      state.projectId = projectId ?? state.projectId;
      state.songId = songId ?? state.songId;
      state.partId = partId;
      state.measure = measure;
      state.loopId = loopId;
    },
    resetApiParam: (state, action) => {
      const { projectId, songId, partId, measure, loopId } = action.payload;
      state.projectId = projectId ? undefined : state.projectId;
      state.songId = songId ? undefined : state.songId;
      state.partId = partId ? undefined : state.partId;
      state.measure = measure ? undefined : state.measure;
      state.loopId = loopId ? undefined : state.loopId;
    },
  },
});

export const {
  setProjectId,
  setSongId,
  setPartId,
  setMeasure,
  setLoopId,
  setApiParam,
  resetApiParam,
} = apiParamSlice.actions;

export const getApiParams = (state) => state.apiParams;
export const getProjectId = (state) => state.apiParams.projectId;
export const getSongId = (state) => state.apiParams.songId;
export const getPartId = (state) => state.apiParams.partId;
export const getMeasure = (state) => state.apiParams.measure;
export const getLoopId = (state) => state.apiParams.loopId;

export default apiParamSlice.reducer;
