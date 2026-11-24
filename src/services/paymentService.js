import api from "./api.js";

const createPaymentSession = async (orderId) => {
  const response = await api.post("/payments/create-session", {
    orderId,
  });

  return response.data;
};

const verifyPaymentSession = async (sessionId) => {
  const response = await api.get(`/payments/verify/${sessionId}`);

  return response.data;
};

const paymentService = {
  createPaymentSession,
  verifyPaymentSession,
};

export default paymentService;
