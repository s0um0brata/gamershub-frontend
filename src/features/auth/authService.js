import api from "../../services/api.js";

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.patch("/users/profile", profileData);
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (token, newPassword) => {
  const response = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });

  return response.data;
};

// Logout user
const logout = async () => {
  const response = await api.post("/users/logout");
  return response.data;
};

const authService = {
  login,
  register,
  refreshAccessToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  logout,
  updateProfile
};

export default authService;
