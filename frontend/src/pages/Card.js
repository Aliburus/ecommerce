import React, { useState, useCallback, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

function Card() {
  const { cart, error, updateCartItem, removeFromCart, loading } = useCart();
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState(cart);
  const latestQuantities = useRef({});
  const abortControllers = useRef({});

  React.useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  // Backend'e sadece en son quantity'yi gönderen ve eski istekleri iptal eden fonksiyon
  const sendQuantityToBackend = async (productId, quantity) => {
    // Önceki istek varsa iptal et
    if (abortControllers.current[productId]) {
      abortControllers.current[productId].abort();
    }
    const controller = new AbortController();
    abortControllers.current[productId] = controller;
    try {
      // updateCartItem fonksiyonunu axios ile yeniden yazıyoruz ki abort desteklesin
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/cart/update`,
        { productId, quantity },
        { withCredentials: true, signal: controller.signal }
      );
    } catch (error) {
      if (axios.isCancel(error)) {
        // İptal edilen istek, bir şey yapma
      } else {
        // Hata olursa localCart'a dokunma
      }
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    latestQuantities.current[productId] = newQuantity;
    setLocalCart((prevCart) => {
      const newItems = prevCart.items.map((item) => {
        if (item.product._id === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      const totalAmount = newItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      return { ...prevCart, items: newItems, totalAmount };
    });
    sendQuantityToBackend(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    setLocalCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => item.product._id !== productId
      );
      const totalAmount = newItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      return { ...prevCart, items: newItems, totalAmount };
    });
    try {
      await removeFromCart(productId);
    } catch (error) {}
  };

  // Ücretsiz kargo için kalan tutar ve progress
  const FREE_SHIPPING_LIMIT = 499;
  const subtotal = localCart?.totalAmount || 0;
  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_LIMIT) * 100);

  // Not ekleme
  const [note, setNote] = useState("");

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!localCart || !localCart.items || localCart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-8">Sepetim</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              Sepetinizde ürün bulunmamaktadır.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-black text-white py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Alışverişe Başla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Ücretsiz kargo barı */}
        <div className="bg-gray-100 rounded-lg p-4 flex items-center mb-8">
          <span className="mr-4 text-gray-700 text-sm">
            🚚{" "}
            {remaining > 0
              ? `${remaining} TL daha harca, kargo bedava!`
              : "Tebrikler! Ücretsiz kargo kazandınız."}
          </span>
          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol: Ürünler */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-semibold mb-6">Sepet</h1>
            <div className="bg-white rounded-lg ">
              {localCart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center border-b last:border-b-0"
                >
                  <div className="w-30 h-40 flex-shrink-0  overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={`${process.env.REACT_APP_API_URL}${
                        item.product.images?.[0]?.url ||
                        item.product.images?.[0]
                      }`}
                      alt={item.product.name}
                      className="w-full h-full object-cover "
                    />
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="font-semibold text-base text-black mb-1">
                      {item.product.name}
                    </div>
                    <div className="text-gray-500 text-xs font-light mb-2">
                      {item.product.color ? item.product.color + " / " : ""}
                      {item.product.size || item.product.variant || ""}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2 text-base font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="ml-4 text-gray-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 size={18} />{" "}
                        <span className="text-sm">Kaldır</span>
                      </button>
                    </div>
                  </div>
                  <div className="ml-6 mr-2 text-right  font-semibold text-lg text-black min-w-[80px]">
                    {item.price} TL
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Sağ: Sipariş Özeti ve Not */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-6">
                <label className="flex items-center gap-2 font-medium text-base mb-2">
                  Not ekle <span className="text-gray-400 text-xs">✏️</span>
                </label>
                <textarea
                  className="w-full border rounded p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/20"
                  rows={2}
                  placeholder="Satıcıya not yaz..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>İndirim</span>
                <span>0 TL</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Ara Toplam</span>
                <span>{subtotal} TL</span>
              </div>
              <div className="text-xs text-gray-500 mb-4 mt-2 text-center">
                Vergi ve kargo ödeme sayfasında hesaplanır
              </div>
              <button
                onClick={() => navigate("/odeme")}
                className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors text-base font-semibold"
              >
                Ödemeye Geç
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
