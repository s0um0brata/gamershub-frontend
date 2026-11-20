import api from "./api.js";

// Register new user
const register = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

// Login existing user
const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  return response.data;
};

// Logout user
const logout = async () => {
  const response = await api.post("/users/logout");

  return response.data;
};

const authService = {
  register,
  login,
  logout
};

export default authService;
