import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectId: 0,
};

export const projectIdSlice = createSlice({
  name: "projectId",
  initialState,
  reducers: {
    setProjectId: (state, action) => {
      const projectId = action.payload;
      state.projectId = projectId;
    },
  },
});

export const { setProjectId } = projectIdSlice.actions;

export default projectIdSlice.reducer;
