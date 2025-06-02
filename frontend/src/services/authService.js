import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (email, password) => {
  return axios.post(
    `${API_URL}/api/user/login`,
    { email, password },
    { withCredentials: true }
  );
};

export const register = async (name, surname, email, password) => {
  return axios.post(
    `${API_URL}/api/user/register`,
    { name, surname, email, password },
    { withCredentials: true }
  );
};

export const getProfile = async () => {
  return axios.get(`${API_URL}/api/user/profile`, { withCredentials: true });
};

export const logout = async () => {
  try {
    await axios.post(
      `${API_URL}/api/user/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  return axios.put(`${API_URL}/api/user/profile`, userData, {
    withCredentials: true,
  });
};
