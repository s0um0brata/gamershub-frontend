import api from "./api.js";

const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

const addToCart = async (gameId) => {
  const response = await api.post(`/cart/${gameId}`);
  return response.data;
};

const removeFromCart = async (gameId) => {
  const response = await api.delete(`/cart/${gameId}`);
  return response.data;
};

const clearCart = async () => {
  const response = await api.delete("/cart");
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};

export default cartService;
