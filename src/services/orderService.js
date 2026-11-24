import api from "./api.js";

const createOrder = async (idempotencyKey, gameId = null) => {
  const response = await api.post("/orders", gameId ? { gameId } : {}, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });

  return response.data;
};

const getMyOrders = async (params = {}) => {
  const response = await api.get("/orders", { params });
  return response.data;
};

const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

const cancelOrder = async (orderId) => {
  const response = await api.delete(`/orders/${orderId}/cancel`);
  return response.data;
};

const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};

export default orderService;
