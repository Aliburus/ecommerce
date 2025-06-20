import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const getAdminSettings = async () => {
  const res = await axios.get(`${API_URL}/api/admin-settings`, {
    withCredentials: true,
  });
  return res.data;
};

export const updateAdminSettings = async (
  notificationSettings,
  storeName,
  contactEmail,
  shippingLimit,
  shippingFee
) => {
  const res = await axios.put(
    `${API_URL}/api/admin-settings`,
    {
      notificationSettings,
      storeName,
      contactEmail,
      shippingLimit,
      shippingFee,
    },
    { withCredentials: true }
  );
  return res.data;
};

export const getStoreInfo = async () => {
  const res = await axios.get(`${API_URL}/api/admin-settings/public`);
  return res.data;
};
