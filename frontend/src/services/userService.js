import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getUsers = async () => {
  const res = await axios.get(`${API_URL}/api/user`, {
    withCredentials: true,
  });
  return res.data;
};
