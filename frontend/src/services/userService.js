import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getUsers = async () => {
  const res = await axios.get(`${API_URL}/api/user`, {
    withCredentials: true,
  });
  return res.data;
};

export const getProfile = async () => {
  const res = await axios.get("/api/user/profile", { withCredentials: true });
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axios.put("/api/user/profile", data, {
    withCredentials: true,
  });
  return res.data;
};

export const changePassword = async (data) => {
  const res = await axios.put("/api/user/change-password", data, {
    withCredentials: true,
  });
  return res.data;
};
