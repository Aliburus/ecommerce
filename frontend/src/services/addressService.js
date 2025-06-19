import axios from "axios";

const API_URL = "/api/addresses";

export const getAddresses = async () => {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data;
};

export const deleteAddress = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};

export const updateAddress = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

export const addAddress = async (data) => {
  const res = await axios.post(API_URL, data, { withCredentials: true });
  return res.data;
};
