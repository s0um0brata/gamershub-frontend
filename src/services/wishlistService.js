import api from "./api.js";

const getWishlist = async () => {
  const response = await api.get("/users/wishlist");
  return response.data;
};

const addToWishlist = async (gameId) => {
  const response = await api.post(`/users/wishlist/${gameId}`);
  return response.data;
};

const removeFromWishlist = async (gameId) => {
  const response = await api.delete(`/users/wishlist/${gameId}`);
  return response.data;
};

const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default wishlistService;
