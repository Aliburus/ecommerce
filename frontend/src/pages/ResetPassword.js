import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Bir hata oluştu");
      }
    } catch (e) {
      setError("Bir hata oluştu");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-black rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-white tracking-tight">
          Yeni Şifre Belirle
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-white">
            Yeni Şifre
          </label>
          <input
            className="w-full p-3 rounded-lg border border-gray-700 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Yeni şifreniz"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-white">
            Yeni Şifre (Tekrar)
          </label>
          <input
            className="w-full p-3 rounded-lg border border-gray-700 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Yeni şifrenizi tekrar girin"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            required
          />
        </div>
        {message && (
          <div className="text-green-500 mb-4 text-center font-semibold">
            {message}
          </div>
        )}
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
          {loading ? "Kaydediliyor..." : "Şifreyi Kaydet"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
