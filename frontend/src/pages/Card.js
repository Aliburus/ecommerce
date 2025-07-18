import React, { useState, useCallback, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getAdminSettings,
  getStoreInfo,
} from "../services/adminSettingsService";
import ProductRecommendations from "../components/ProductRecommendations";
import { useAuth } from "../context/AuthContext";

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

  // İndirim kodu
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);

  const [categoryDiscount, setCategoryDiscount] = useState({
    totalDiscount: 0,
    appliedDiscounts: [],
  });

  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let settings;
        if (user && user.isAdmin) {
          settings = await getAdminSettings();
        } else {
          settings = await getStoreInfo();
        }
        setAdminSettings(settings);
      } catch (error) {
        console.error("Ayarlar alınamadı:", error);
      }
    };
    fetchSettings();
  }, [user]);

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
  const totalDiscount = categoryDiscount.totalDiscount || 0;
  const discountedSubtotal = subtotal - totalDiscount;
  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_LIMIT) * 100);
  const isFreeShipping = subtotal >= FREE_SHIPPING_LIMIT;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_FEE;

  // Not ekleme
  const [note, setNote] = useState("");

  const handleDiscountCheck = async () => {
    setDiscountLoading(true);
    setDiscountError("");
    setDiscountResult(null);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/discounts/validate`,
        { code: discountCode, totalAmount: subtotal },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setDiscountResult(data);
    } catch (err) {
      console.error("İndirim kodu hatası:", err);
      setDiscountError(
        err.response?.data?.message || "İndirim kodu geçersiz veya hata oluştu"
      );
    } finally {
      setDiscountLoading(false);
    }
  };

  // Sepetteki ürünler değiştikçe kategori indirimi uygula
  useEffect(() => {
    if (!localCart || !localCart.items) return;
    const applyCategoryDiscount = async () => {
      if (!localCart.items.length) {
        setCategoryDiscount({ totalDiscount: 0, appliedDiscounts: [] });
        return;
      }
      try {
        const items = localCart.items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.price,
        }));
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/discounts/apply-category`,
          { items },
          { withCredentials: true }
        );
        setCategoryDiscount(data);
      } catch (err) {
        setCategoryDiscount({ totalDiscount: 0, appliedDiscounts: [] });
      }
    };
    applyCategoryDiscount();
  }, [localCart, localCart && localCart.items]);

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
          <div className="bg-white  shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              Sepetinizde ürün bulunmamaktadır.
            </p>
            <button
              onClick={() => navigate("/men")}
              className="bg-black text-white py-2 px-6  hover:bg-gray-800 transition-colors"
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
        <div className="bg-gray-100 p-4 flex flex-col gap-2 mb-8 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-black font-medium">
              {isFreeShipping
                ? "Tebrikler! Ücretsiz kargo kazandınız."
                : `Kargo ücreti ödememek için ${remaining} TL'lik ürün alın!`}
            </span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol: Ürünler */}
          <div className="lg:col-span-2">
            <div className="bg-white  divide-y divide-gray-100 shadow-md">
              {localCart.items.map((item, idx) => (
                <div
                  key={item.product._id + (item.size || item.variant || "")}
                  className={`flex flex-col sm:flex-row items-center py-6 px-4 ${
                    idx !== localCart.items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="w-28 h-36 flex-shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center ">
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
                      <Link
                        to={`/urun/${item.product._id}`}
                        className="hover:underline text-blue-600"
                      >
                        {item.product.name}
                      </Link>
                    </div>
                    {item.size && (
                      <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-200  border border-gray-300">
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
                        className="w-8 h-8 border  flex items-center justify-center hover:bg-gray-100"
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
                        className="w-8 h-8 border  flex items-center justify-center hover:bg-gray-100"
                        disabled={
                          itemLoading[item.product._id + (item.size || "")]
                        }
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveItem(item.product._id, item.size || "")
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
            <div
              className="bg-white  p-8 shadow-md flex flex-col gap-4 sticky top-8"
              style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}
            >
              <h2 className="text-xl font-bold mb-4 text-black">
                Sipariş Özeti
              </h2>
              <div className="flex justify-between mb-2 text-base text-black">
                <span>Ürünün Toplamı</span>
                <span>{subtotal} TL</span>
              </div>
              <div className="flex justify-between mb-2 text-base text-black">
                <span>Kargo Toplam</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="font-semibold">Bedava</span>
                  ) : (
                    `${shippingCost} TL`
                  )}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between mb-2 text-base text-black">
                  <span>İndirim</span>
                  <span>-{totalDiscount} TL</span>
                </div>
              )}
              <div className="border-t pt-4 mt-2 flex justify-between items-center text-lg font-bold text-black">
                <span>Toplam</span>
                <span>{(discountedSubtotal + shippingCost).toFixed(2)} TL</span>
              </div>
              <button
                className="mt-6 w-full py-3  bg-black text-white font-semibold text-lg hover:bg-gray-900 transition"
                onClick={() =>
                  navigate("/address-select", {
                    state: {
                      items: localCart.items.map((item) => ({
                        product: item.product._id,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.size,
                      })),
                      paymentMethod: "iyzico",
                      totalAmount: discountedSubtotal + shippingCost,
                    },
                  })
                }
              >
                Ödemeye Geç
              </button>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1 text-black">
                  İndirim Kodu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="border  px-3 py-2 flex-1 text-black"
                    placeholder="Kodu girin"
                  />
                  <button
                    type="button"
                    onClick={handleDiscountCheck}
                    className="bg-black text-white px-4 py-2  hover:bg-gray-900"
                    disabled={discountLoading || !discountCode}
                  >
                    {discountLoading ? "Kontrol..." : "Uygula"}
                  </button>
                </div>
                {discountError && (
                  <div className="text-red-600 text-sm mt-2">
                    {discountError}
                  </div>
                )}
                {discountResult && (
                  <div className="text-green-600 text-sm mt-2">
                    Kod uygulandı! İndirim: {discountResult.discountAmount} TL
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-4 text-center">
                Vergi ve kargo ödeme sayfasında hesaplanır
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <ProductRecommendations />
        </div>
      </div>
    </div>
  );
}

export default Card;
