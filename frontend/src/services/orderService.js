import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getOrders = async () => {
  const res = await axios.get(`${API_URL}/api/orders`, {
    withCredentials: true,
  });
  return res.data.orders;
};
