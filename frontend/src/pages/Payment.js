import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";

const CARD_TYPES = [
  "Master Card (Debit)",
  "Master Card (Credit)",
  "Visa (Debit)",
  "Visa (Credit)",
  "Troy (Debit)",
  "Troy (Credit)",
  "American Express",
];

const Payment = () => {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const params = location.state || {};
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    bank: "",
    cardType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInput = (field, value) => {
    setCardInfo({ ...cardInfo, [field]: value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      ...params,
      paymentMethod: "iyzico",
      cardInfo: {
        ...cardInfo,
        expireMonth: "12",
        expireYear: "25",
        cvc: "123",
        cardHolderName: user?.name || "Test Kullanıcı",
      },
    };
    console.log("Ödeme gönderilen veri:", payload);
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        await refreshCart();
        Swal.fire({
          title: "Başarılı!",
          text: "Ödeme tamamlandı ve sepetiniz temizlendi.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/");
      } else {
        setError(data.message || "Ödeme başarısız");
      }
    } catch (e) {
      setError("Bir hata oluştu");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <form
        onSubmit={handlePayment}
        className="bg-black rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
      >
        <div className="mb-8">
          <div className="text-center text-2xl font-extrabold text-white mb-2">
            Ödeme Tutarı
          </div>
          <div className="text-center text-4xl font-black text-white tracking-tight">
            {params.totalAmount ? params.totalAmount + " ₺" : "--"}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-8 text-center text-white tracking-tight">
          Kart ile Ödeme
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-white">
            Kart Numarası
          </label>
          <input
            className="w-full p-3 rounded-lg border border-gray-700 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="16 haneli kart numarası"
            value={cardInfo.cardNumber}
            onChange={(e) => handleInput("cardNumber", e.target.value)}
            maxLength={16}
            required
            inputMode="numeric"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-white">
            Banka
          </label>
          <input
            className="w-full p-3 rounded-lg border border-gray-700 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Banka adı"
            value={cardInfo.bank}
            onChange={(e) => handleInput("bank", e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-white">
            Kart Tipi
          </label>
          <select
            className="w-full p-3 rounded-lg border border-gray-700 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black transition"
            value={cardInfo.cardType}
            onChange={(e) => handleInput("cardType", e.target.value)}
            required
          >
            <option value="" disabled>
              Seçiniz
            </option>
            {CARD_TYPES.map((type, i) => (
              <option key={i} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="text-red-500 mb-4 text-center font-semibold">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-3 rounded-lg transition hover:bg-gray-100 border border-black disabled:opacity-60 shadow-md"
          disabled={loading}
        >
          {loading ? "Ödeniyor..." : "Ödemeyi Tamamla"}
        </button>
      </form>
    </div>
  );
};

export default Payment;
