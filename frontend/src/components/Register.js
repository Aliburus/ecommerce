import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ad alanı zorunludur";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Soyad alanı zorunludur";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email alanı zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir email adresi giriniz";
    }

    if (!formData.password) {
      newErrors.password = "Şifre alanı zorunludur";
    } else if (formData.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalıdır";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.name,
        formData.surname,
        formData.email,
        formData.password
      );
      navigate("/login", {
        state: { message: "Kayıt başarılı! Giriş yapabilirsiniz." },
      });
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || "Kayıt işlemi başarısız oldu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-12 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-black">
            Hesap Oluştur
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link
              to="/login"
              className="font-bold text-black hover:text-gray-800"
            >
              Giriş yapın
            </Link>
          </p>
        </div>

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-lg">
            {errors.submit}
          </div>
        )}

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-medium text-black mb-1"
              >
                Ad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full border-2 ${
                  errors.name ? "border-red-500" : "border-black"
                } bg-white text-black text-xl py-4 px-4 outline-none focus:outline-none focus:ring-0`}
                style={{ boxShadow: "none" }}
              />
              {errors.name && (
                <p className="mt-1 text-base text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="surname"
                className="block text-lg font-medium text-black mb-1"
              >
                Soyad
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                required
                value={formData.surname}
                onChange={handleChange}
                className={`mt-1 block w-full border-2 ${
                  errors.surname ? "border-red-500" : "border-black"
                } bg-white text-black text-xl py-4 px-4 outline-none focus:outline-none focus:ring-0`}
                style={{ boxShadow: "none" }}
              />
              {errors.surname && (
                <p className="mt-1 text-base text-red-600">{errors.surname}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-black mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full border-2 ${
                errors.email ? "border-red-500" : "border-black"
              } bg-white text-black text-xl py-4 px-4 outline-none focus:outline-none focus:ring-0`}
              style={{ boxShadow: "none" }}
            />
            {errors.email && (
              <p className="mt-1 text-base text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium text-black mb-1"
            >
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full border-2 ${
                errors.password ? "border-red-500" : "border-black"
              } bg-white text-black text-xl py-4 px-4 outline-none focus:outline-none focus:ring-0`}
              style={{ boxShadow: "none" }}
            />
            {errors.password && (
              <p className="mt-1 text-base text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-lg font-medium text-black mb-1"
            >
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`mt-1 block w-full border-2 ${
                errors.confirmPassword ? "border-red-500" : "border-black"
              } bg-white text-black text-xl py-4 px-4 outline-none focus:outline-none focus:ring-0`}
              style={{ boxShadow: "none" }}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-base text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border-2 border-black text-xl font-bold text-white ${
                loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
              } outline-none focus:outline-none focus:ring-0`}
              style={{ boxShadow: "none" }}
            >
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
