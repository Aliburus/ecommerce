import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getCollections = async () => {
  const res = await axios.get(`${API_URL}/api/collections`);
  return res.data;
};

export const createCollection = async (collectionData) => {
  const res = await axios.post(`${API_URL}/api/collections`, collectionData, {
    withCredentials: true,
  });
  return res.data;
};

export const addProductToCollection = async (collectionId, productId) => {
  const res = await axios.post(
    `${API_URL}/api/collections/${collectionId}/add-product`,
    { productId },
    { withCredentials: true }
  );
  return res.data;
};

export const deleteCollection = async (collectionId) => {
  const res = await axios.delete(`${API_URL}/api/collections/${collectionId}`, {
    withCredentials: true,
  });
  return res.data;
};

export const updateCollection = async (collectionId, updateData) => {
  const res = await axios.put(
    `${API_URL}/api/collections/${collectionId}`,
    updateData,
    { withCredentials: true }
  );
  return res.data;
};
