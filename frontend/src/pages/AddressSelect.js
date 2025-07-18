import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAddresses, addAddress } from "../services/addressService";

const emptyForm = {
  title: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

const AddressSelect = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state || {};

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAddresses();
        setAddresses(data);
      } catch (err) {
        setError("Adresler alınamadı");
      }
      setLoading(false);
    };
    fetchAddresses();
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    navigate("/payment", {
      state: {
        ...params,
        shippingAddress: selected,
      },
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setValidation((v) => ({ ...v, [name]: undefined }));
  };

  const validateForm = () => {
    const newValidation = {};
    if (!form.fullName) newValidation.fullName = "Ad Soyad zorunlu";
    if (!form.phone) newValidation.phone = "Telefon zorunlu";
    if (!form.city) newValidation.city = "İl zorunlu";
    if (!form.title) newValidation.title = "Adres başlığı zorunlu";
    if (!form.address) newValidation.address = "Adres zorunlu";
    setValidation(newValidation);
    return Object.keys(newValidation).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setError("");
    try {
      const newAddress = await addAddress(form);
      setAddresses([newAddress, ...addresses]);
      setSelected(newAddress);
      setForm(emptyForm);
    } catch (err) {
      setError("Adres eklenemedi");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-black rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-8 text-center text-white tracking-tight">
          Teslimat Adresi Seç
        </h2>
        {loading ? (
          <div className="text-center text-white">Yükleniyor...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : addresses.length === 0 ? (
          <form onSubmit={handleFormSubmit} className="space-y-4 mb-8">
            <div className="text-white text-center mb-4">
              Adres eklemeden devam edemezsin.
            </div>
            <input
              className="w-full p-3 rounded border border-gray-700"
              name="title"
              value={form.title || ""}
              onChange={handleFormChange}
              placeholder="Adres Başlığı (Ev, İş vb.)"
              required
            />
            {validation.title && (
              <div className="text-red-500 text-sm">{validation.title}</div>
            )}
            <input
              className="w-full p-3 rounded border border-gray-700"
              name="fullName"
              value={form.fullName || ""}
              onChange={handleFormChange}
              placeholder="Ad Soyad"
              required
            />
            {validation.fullName && (
              <div className="text-red-500 text-sm">{validation.fullName}</div>
            )}
            <input
              className="w-full p-3 rounded border border-gray-700"
              name="phone"
              value={form.phone || ""}
              onChange={handleFormChange}
              placeholder="Telefon"
              required
            />
            {validation.phone && (
              <div className="text-red-500 text-sm">{validation.phone}</div>
            )}
            <input
              className="w-full p-3 rounded border border-gray-700"
              name="city"
              value={form.city || ""}
              onChange={handleFormChange}
              placeholder="İl"
              required
            />
            {validation.city && (
              <div className="text-red-500 text-sm">{validation.city}</div>
            )}
            <input
              className="w-full p-3 rounded border border-gray-700"
              name="state"
              value={form.state || ""}
              onChange={handleFormChange}
              placeholder="İlçe"
            />
            <input
              className="w-full p-3 rounded border border-gray-700"
              name="country"
              value={form.country || ""}
              onChange={handleFormChange}
              placeholder="Ülke"
            />
            <input
              className="w-full p-3 rounded border border-gray-700"
              name="zipCode"
              value={form.zipCode || ""}
              onChange={handleFormChange}
              placeholder="Posta Kodu"
            />
            <textarea
              className="w-full p-3 rounded border border-gray-700"
              name="address"
              value={form.address || ""}
              onChange={handleFormChange}
              placeholder="Adres"
              required
            />
            {validation.address && (
              <div className="text-red-500 text-sm">{validation.address}</div>
            )}
            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-3 rounded-lg transition hover:bg-gray-100 border border-black disabled:opacity-60 shadow-md"
              disabled={saving}
            >
              {saving ? "Kaydediliyor..." : "Adresi Ekle"}
            </button>
          </form>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {addresses.map((address) => (
                <label
                  key={address._id}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selected && selected._id === address._id
                      ? "border-white bg-white text-black"
                      : "border-gray-700 bg-black text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mr-3 accent-black"
                    checked={selected && selected._id === address._id}
                    onChange={() => setSelected(address)}
                  />
                  <span className="font-semibold">{address.title}</span> -{" "}
                  {address.fullName}
                  <br />
                  <span className="text-sm">
                    {address.address}, {address.city} {address.state}{" "}
                    {address.country} {address.zipCode}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="w-full bg-white text-black font-bold py-3 rounded-lg transition hover:bg-gray-100 border border-black disabled:opacity-60 shadow-md"
            >
              Devam Et
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddressSelect;
