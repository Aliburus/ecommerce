import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/api/categories`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axios.post(`${API_URL}/api/categories`, categoryData);
  return response.data;
};

export const getBestSellingCategories = async () => {
  const res = await axios.get(`${API_URL}/api/categories/best-sellers`);
  return res.data;
};

export const getCategoriesWithProducts = async () => {
  const response = await axios.get(`${API_URL}/api/categories/with-products`);
  return response.data;
};
