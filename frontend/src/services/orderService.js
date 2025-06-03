import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Get all orders
export const getOrders = async (search = "") => {
  const response = await axios.get(
    `${API_URL}/api/orders${
      search ? `?search=${encodeURIComponent(search)}` : ""
    }`,
    {
      withCredentials: true,
    }
  );
  return response.data.orders || [];
};

// Get order by ID
export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/api/orders/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, status, note) => {
  const response = await axios.put(
    `${API_URL}/api/orders/${orderId}/status`,
    { status, note },
    {
      withCredentials: true,
    }
  );
  return response.data;
};
