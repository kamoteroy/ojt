import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: { user: null, accessToken: "", refreshToken: "", permissions: [] },
  },
  reducers: {
    userLogged: (state, action) => {
      state.value = action.payload;
    },
    logout: (state) => {
      state.value = initialState;
    },
  },
});

export const { userLogged } = userSlice.actions;

export default userSlice.reducer;
