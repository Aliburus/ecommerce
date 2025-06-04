import React, { useState, useCallback, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAdminSettings } from "../services/adminSettingsService";

function Card() {
  const { cart, error, updateCartItem, removeFromCart, loading } = useCart();
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState(cart);
  const latestQuantities = useRef({});
  const abortControllers = useRef({});
  const [itemLoading, setItemLoading] = useState({});
  const [adminSettings, setAdminSettings] = useState({
    shippingLimit: 500,
    shippingFee: 49.9,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAdminSettings();
        setAdminSettings(settings);
      } catch (error) {
        console.error("Ayarlar alınamadı:", error);
      }
    };
    fetchSettings();
  }, []);

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

  const handleQuantityChange = async (productId, newQuantity, size) => {
    if (newQuantity < 1) return;
    const key = productId + (size || "");
    setItemLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await updateCartItem(productId, newQuantity, size);
    } finally {
      setItemLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRemoveItem = async (productId, size) => {
    try {
      await removeFromCart(productId, size);
    } catch (error) {}
  };

  // Ücretsiz kargo için kalan tutar ve progress
  const FREE_SHIPPING_LIMIT = adminSettings.shippingLimit || 500;
  const SHIPPING_FEE = adminSettings.shippingFee || 49.9;
  const subtotal = localCart?.totalAmount || 0;
  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_LIMIT) * 100);
  const isFreeShipping = subtotal >= FREE_SHIPPING_LIMIT;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;

  // Not ekleme
  const [note, setNote] = useState("");

  if (loading && (!localCart || !localCart.items)) return <LoadingSpinner />;

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
              onClick={() => navigate("/urun")}
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
            {isFreeShipping
              ? "Tebrikler! Ücretsiz kargo kazandınız."
              : `Kargo ücreti ödememek için ${remaining} TL lik ürün alın!`}
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
            <div className="bg-white rounded-lg divide-y divide-gray-100 shadow-md">
              {localCart.items.map((item, idx) => (
                <div
                  key={item.product._id + (item.size || item.variant || "")}
                  className={`flex flex-col sm:flex-row items-center py-6 px-4 ${
                    idx !== localCart.items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="w-28 h-36 flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center rounded-md">
                    <img
                      src={`${process.env.REACT_APP_API_URL}${
                        item.product.images?.[0]?.url ||
                        item.product.images?.[0]
                      }`}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:ml-6 flex-1 w-full mt-4 sm:mt-0">
                    <div className="font-semibold text-base text-black mb-1 line-clamp-2">
                      {item.product.name}
                    </div>
                    {item.size && (
                      <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-200 rounded border border-gray-300">
                          Beden: {item.size}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity - 1,
                            item.size
                          )
                        }
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                        disabled={
                          itemLoading[item.product._id + (item.size || "")]
                        }
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2 text-base font-medium min-w-[2rem] text-center">
                        {itemLoading[item.product._id + (item.size || "")] ? (
                          <svg
                            className="animate-spin h-5 w-5 text-gray-500 mx-auto"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity + 1,
                            item.size
                          )
                        }
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                        disabled={
                          itemLoading[item.product._id + (item.size || "")]
                        }
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveItem(item.product._id, item.size)
                        }
                        className="ml-4 text-gray-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 size={18} />{" "}
                        <span className="text-sm">Kaldır</span>
                      </button>
                    </div>
                  </div>
                  <div className="sm:ml-6 sm:mr-2 text-right font-semibold text-lg text-black min-w-[80px] mt-4 sm:mt-0">
                    {item.price} TL
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Sağ: Sipariş Özeti ve Not */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-8 shadow-md flex flex-col gap-4 sticky top-8">
              <div className="mb-4">
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
              <div className="flex justify-between mb-2 text-sm">
                <span>Kargo</span>
                <span>
                  {isFreeShipping ? "Ücretsiz" : `${SHIPPING_FEE} TL`}
                </span>
              </div>
              <div className="flex justify-between mb-2 text-base font-semibold">
                <span>Genel Toplam</span>
                <span>{(subtotal + shippingCost).toFixed(2)} TL</span>
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
