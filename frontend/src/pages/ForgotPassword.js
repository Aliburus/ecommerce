import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
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
          Şifremi Unuttum
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-white">
            E-posta
          </label>
          <input
            className="w-full p-3 rounded-lg border border-gray-700 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
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
          {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
