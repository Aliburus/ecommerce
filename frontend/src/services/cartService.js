import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const addToCart = async (productId, quantity) => {
  const response = await axios.post(
    `${API_URL}/api/cart/add`,
    { productId, quantity },
    { withCredentials: true }
  );
  return response.data;
};

const getCart = async () => {
  const response = await axios.get(`${API_URL}/api/cart`, {
    withCredentials: true,
  });
  return response.data;
};

const updateCartItem = async (productId, quantity) => {
  const response = await axios.put(
    `${API_URL}/api/cart/update`,
    { productId, quantity },
    { withCredentials: true }
  );
  return response.data;
};

const removeFromCart = async (productId) => {
  const response = await axios.delete(
    `${API_URL}/api/cart/remove/${productId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

const cartService = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
};

export default cartService;
