import api from "./api.js";

// Get all active public categories
const getActiveCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

const categoryService = {
  getActiveCategories,
};

export default categoryService;
