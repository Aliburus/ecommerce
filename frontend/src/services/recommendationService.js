import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getRecommendations = async () => {
  const res = await axios.get(`${API_URL}/api/recommendations`, {
    withCredentials: true,
  });
  return res.data;
};

export const addInteraction = async (productId, type) => {
  const res = await axios.post(
    `${API_URL}/api/recommendations/interaction`,
    { productId, type },
    { withCredentials: true }
  );
  return res.data;
};
