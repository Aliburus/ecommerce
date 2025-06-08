import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const createCampaign = async (campaignData) => {
  const res = await axios.post(`${API_URL}/api/email-campaigns`, campaignData, {
    withCredentials: true,
  });
  return res.data;
};

export const getCampaigns = async () => {
  const res = await axios.get(`${API_URL}/api/email-campaigns`, {
    withCredentials: true,
  });
  return res.data;
};

export const getCampaign = async (id) => {
  const res = await axios.get(`${API_URL}/api/email-campaigns/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const sendCampaign = async (id) => {
  const res = await axios.post(
    `${API_URL}/api/email-campaigns/${id}/send`,
    {},
    { withCredentials: true }
  );
  return res.data;
};
