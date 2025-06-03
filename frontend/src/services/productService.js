import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getProducts = async () => {
  const res = await axios.get(`${API_URL}/api/products/all`);
  return res.data;
};

export const createProduct = async (formData, isFormData = false) => {
  const config = {
    withCredentials: true,
  };
  if (isFormData) {
    config.headers = { "Content-Type": "multipart/form-data" };
  }
  const res = await axios.post(`${API_URL}/api/products`, formData, config);
  return res.data;
};

export const deleteProduct = async (productId) => {
  const res = await axios.delete(`${API_URL}/api/products/${productId}`, {
    withCredentials: true,
  });
  return res.data;
};

export const updateProduct = async (productId, updateData) => {
  const res = await axios.put(
    `${API_URL}/api/products/${productId}`,
    updateData,
    { withCredentials: true }
  );
  return res.data;
};

export const getBestSellingProducts = async () => {
  const res = await axios.get(`${API_URL}/api/products/best-sellers`);
  return res.data;
};
