import { createSlice } from "@reduxjs/toolkit";

import { loginUser, restoreSession, logoutUser } from "./authThunks.js";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  isRestoring: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },

    setAuthError: (state, action) => {
      state.error = action.payload;
    },

    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitializing = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed.";
      })

      // Session restoration
      .addCase(restoreSession.pending, (state) => {
        state.isInitializing = true;
        state.isRestoring = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.isRestoring = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isInitializing = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isRestoring = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed.";
      });
  },
});

export const { setCredentials, setAuthError, clearAuth } = authSlice.actions;

export default authSlice.reducer;
