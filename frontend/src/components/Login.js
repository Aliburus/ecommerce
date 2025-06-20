import React, { useState, useEffect } from "react";
import { login } from "../services/authService";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kayıt sayfasından gelen mesajı göster
    if (location.state?.message) {
      setErrors({ message: location.state.message });
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email alanı zorunludur";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Geçerli bir email adresi giriniz";
    }

    if (!formData.password) {
      newErrors.password = "Şifre alanı zorunludur";
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
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      const defaultMsg =
        "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.";
      setErrors({
        submit: error?.response?.data?.message || error?.message || defaultMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-8 px-2 sm:px-4 lg:px-6">
      <div className="max-w-sm w-full space-y-6 bg-white p-6 shadow-md ">
        <div>
          <h2 className="mt-4 text-center text-2xl font-bold text-black">
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-center text-base text-gray-600">
            Hesabınız yok mu?{" "}
            <Link
              to="/register"
              className="font-bold text-black hover:text-gray-800"
            >
              Kayıt olun
            </Link>
          </p>
        </div>

        {(errors.message || errors.submit) && (
          <div
            className={`px-3 py-2 text-base ${
              errors.message
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {errors.message || errors.submit}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-base font-medium text-black mb-1"
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
              className={`mt-1 block w-full border ${
                errors.email ? "border-red-500" : "border-black"
              } bg-white text-black text-base py-2 px-3 outline-none focus:outline-none focus:ring-0 `}
              style={{ boxShadow: "none" }}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-base font-medium text-black mb-1"
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
              className={`mt-1 block w-full border ${
                errors.password ? "border-red-500" : "border-black"
              } bg-white text-black text-base py-2 px-3 outline-none focus:outline-none focus:ring-0 `}
              style={{ boxShadow: "none" }}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-black border-black outline-none focus:outline-none focus:ring-0"
                style={{ boxShadow: "none" }}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-black"
              >
                Beni hatırla
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-bold text-black hover:text-gray-800">
                Şifremi unuttum
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-3 border border-black text-base font-bold text-white ${
                loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
              } outline-none focus:outline-none focus:ring-0 `}
              style={{ boxShadow: "none" }}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
