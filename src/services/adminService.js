import api from "./api.js";

// Get all games for the admin panel
const getAdminGames = async (params = {}) => {
  const response = await api.get("/admin/games", {
    params,
  });

  return response.data;
};

// Get a single game for editing
const getAdminGameById = async (gameId) => {
  const response = await api.get(`/admin/games/${gameId}`);

  return response.data;
};

// Get all categories for the admin panel
const getAdminCategories = async () => {
  const response = await api.get("/admin/categories");

  return response.data;
};

// Create a new category
const createCategory = async (categoryData) => {
  const response = await api.post("/admin/categories", categoryData);
  return response.data;
};

// Update an existing category
const updateCategory = async (categoryId, categoryData) => {
  const response = await api.patch(
    `/admin/categories/${categoryId}`,
    categoryData,
  );
  return response.data;
};

// Deactivate a category
const deactivateCategory = async (categoryId) => {
  const response = await api.delete(`/admin/categories/${categoryId}`);
  return response.data;
};

// Create a new game
const createGame = async (formData) => {
  const response = await api.post("/admin/games", formData);

  return response.data;
};

// Update an existing game
const updateGame = async (gameId, formData) => {
  const response = await api.patch(`/admin/games/${gameId}`, formData);

  return response.data;
};

// Permanently delete a game
const permanentlyDeleteGame = async (gameId) => {
  const response = await api.delete(`/admin/games/${gameId}/permanent`);

  return response.data;
};

const adminService = {
  getAdminGames,
  getAdminCategories,
  createGame,
  createCategory,
  updateCategory,
  deactivateCategory,
  updateGame,
  getAdminGameById,
  permanentlyDeleteGame
};

export default adminService;
