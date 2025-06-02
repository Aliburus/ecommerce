import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/wishlist`,
        { withCredentials: true }
      );
      setWishlist(res.data.map((item) => item.product._id));
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const addToWishlist = async (productId) => {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/user/wishlist/add`,
      { productId },
      { withCredentials: true }
    );
    setWishlist((prev) => [...prev, productId]);
  };

  const removeFromWishlist = async (productId) => {
    await axios.post(
      `${process.env.REACT_APP_API_URL}/api/user/wishlist/remove`,
      { productId },
      { withCredentials: true }
    );
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
