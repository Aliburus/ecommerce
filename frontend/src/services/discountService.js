import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const getUserDiscounts = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/discounts/my-discounts`,
    { withCredentials: true }
  );
  return response.data;
};
