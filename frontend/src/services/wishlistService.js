import axios from "axios";
import { addInteraction } from "./recommendationService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const addToWishlist = async (productId) => {
  const response = await axios.post(
    `${API_URL}/api/wishlist/add`,
    { productId },
    { withCredentials: true }
  );
  // Öneri sistemi için etkileşimi kaydet
  await addInteraction(productId, "wishlist");
  return response.data;
};

const removeFromWishlist = async (productId) => {
  const response = await axios.delete(
    `${API_URL}/api/wishlist/remove/${productId}`,
    { withCredentials: true }
  );
  return response.data;
};

const getWishlist = async () => {
  const response = await axios.get(`${API_URL}/api/wishlist`, {
    withCredentials: true,
  });
  return response.data;
};

const wishlistService = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};

export default wishlistService;
