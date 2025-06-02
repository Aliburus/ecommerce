import React, { createContext, useState, useContext, useEffect } from "react";
import cartService from "../services/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Sepet yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      const data = await cartService.addToCart(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      setError(
        err.response?.data?.message || "Ürün sepete eklenirken hata oluştu"
      );
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const data = await cartService.updateCartItem(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      setError(
        err.response?.data?.message || "Sepet güncellenirken hata oluştu"
      );
      return { success: false, error: err.response?.data?.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const data = await cartService.removeFromCart(productId);
      setCart(data.cart);
      return { success: true };
    } catch (err) {
      setError(
        err.response?.data?.message || "Ürün sepetten silinirken hata oluştu"
      );
      return { success: false, error: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
