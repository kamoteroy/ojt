import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: { user: null, accessToken: "", refreshToken: "", permissions: [] },
  },
  reducers: {
    login: (state, action) => {
      state.value = action.payload;
    },
    logout: (state) => {
      state.value = {};
    },
  },
});

export const { login } = userSlice.actions;

export default userSlice.reducer;
