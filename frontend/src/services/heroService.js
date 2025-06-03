import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getHero = async () => {
  const res = await axios.get(`${API_URL}/api/hero`);
  return res.data;
};

export const updateHero = async (heroData) => {
  const res = await axios.put(`${API_URL}/api/hero`, heroData, {
    withCredentials: true,
  });
  return res.data;
};
