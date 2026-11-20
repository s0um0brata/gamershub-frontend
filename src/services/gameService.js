import api from "./api.js";

// Get all published games
const getAllGames = async (params = {}) => {
  const response = await api.get("/games", {
    params,
  });

  return response.data;
};

// Get featured published games
const getFeaturedGames = async (params = {}) => {
  const response = await api.get("/games/featured", {
    params,
  });

  return response.data;
};

// Get single game details by slug
const getGameBySlug = async (slug) => {
  const response = await api.get(`/games/${slug}`);

  return response.data;
};

const gameService = {
  getAllGames,
  getFeaturedGames,
  getGameBySlug,
};

export default gameService;
