import { createAsyncThunk } from "@reduxjs/toolkit";

import authService from "./authService.js";
import { setAccessToken, clearAccessToken } from "../../services/api.js";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      const { user, accessToken } = response.data || {};

      if (!user || !accessToken) {
        return rejectWithValue("Invalid login response from the server.");
      }

      setAccessToken(accessToken);

      return { user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again.",
      );
    }
  },
);


export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshAccessToken();

      const accessToken = response.data?.accessToken;

      if (!accessToken) {
        throw new Error("Access token was not returned.");
      }

      setAccessToken(accessToken);

      const profileResponse = await authService.getCurrentUser();

      const user = profileResponse.data?.user;

      if (!user) {
        throw new Error("User profile was not returned.");
      }

      return { user };
    } catch (error) {
      clearAccessToken();

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Session could not be restored.",
      );
    }
  },
  {
    condition: (_, { getState }) => {
      return !getState().auth.isRestoring;
    },
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();

      clearAccessToken();

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Logout failed. Please try again.",
      );
    }
  },
);

