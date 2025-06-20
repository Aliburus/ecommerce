import React, { useEffect, useState } from "react";
import {
  getAddresses,
  deleteAddress,
  updateAddress,
  addAddress,
} from "../../services/addressService";
import Modal from "../Modal";
import LoadingSpinner from "../LoadingSpinner";

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

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState({});

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

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteAddress(id);
      setAddresses(addresses.filter((a) => a._id !== id));
    } catch (err) {
      setError("Adres silinemedi");
    }
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditMode(false);
    setModalOpen(true);
    setSelectedId(null);
  };

  const openEditModal = (address) => {
    setForm({ ...address });
    setEditMode(true);
    setModalOpen(true);
    setSelectedId(address._id);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setSelectedId(null);
    setEditMode(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      let phone = value.replace(/[^0-9]/g, "");
      if (phone.startsWith("0")) {
        setValidation((v) => ({
          ...v,
          phone: "Telefon numarasının başında 0 olmamalı",
        }));
        phone = phone.replace(/^0+/, "");
      } else {
        setValidation((v) => ({ ...v, phone: undefined }));
      }
      setForm({ ...form, [name]: phone });
    } else {
      setForm({ ...form, [name]: value });
      setValidation((v) => ({ ...v, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newValidation = {};
    if (!form.fullName) newValidation.fullName = "Ad Soyad zorunlu";
    if (!form.phone) newValidation.phone = "Telefon zorunlu";
    if (form.phone && form.phone.startsWith("0"))
      newValidation.phone = "Telefon numarasının başında 0 olmamalı";
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
      let submitForm = { ...form };
      if (submitForm.phone) {
        let phone = submitForm.phone.replace(/[^0-9]/g, "");
        phone = phone.replace(/^0+/, "");
        submitForm.phone = phone ? "0" + phone : "";
      }
      if (editMode) {
        const updated = await updateAddress(selectedId, submitForm);
        setAddresses(
          addresses.map((a) => (a._id === selectedId ? updated : a))
        );
      } else {
        const newAddress = await addAddress(submitForm);
        setAddresses([newAddress, ...addresses]);
      }
      closeModal();
    } catch (err) {
      setError("İşlem başarısız oldu");
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Adres Bilgilerim</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 text-black font-medium border border-black rounded px-4 py-2 hover:bg-black hover:text-white transition bg-white"
        >
          <span className="text-xl">+</span> Yeni Adres Ekle
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12 text-lg">
            Kayıtlı adresiniz yok.
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className="border rounded-lg bg-white p-4 flex flex-col min-h-[220px]"
            >
              <div className="font-semibold text-lg mb-2">{address.title}</div>
              <div className="flex-1">
                <div className="font-bold mb-1">{address.fullName}</div>
                <div>{address.address}</div>
                <div>
                  {address.city}
                  {address.state ? "/" + address.state : ""}
                </div>
                <div>{address.country}</div>
                <div>
                  {address.phone
                    ? (() => {
                        let phone = address.phone.replace(/^0+/, "");
                        phone = "0" + phone;
                        return phone.replace(
                          /(0\d{3})(\d{3})(\d{2})(\d{2})$/,
                          (_, p1, p2, p3, p4) => `${p1}*** ** ${p4}`
                        );
                      })()
                    : ""}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => handleDelete(address._id)}
                  className="text-gray-600 hover:text-red-500"
                  title="Sil"
                  style={{ padding: 0, border: "none", background: "none" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
                <button
                  onClick={() => openEditModal(address)}
                  className="border border-black text-black rounded px-4 py-2 hover:bg-black hover:text-white transition bg-white"
                >
                  Adresi Düzenle
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editMode ? "Adres Düzenle" : "Adres Ekle"}
      >
        <form
          onSubmit={handleFormSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            className="border p-2 rounded"
            name="fullName"
            value={form.fullName}
            onChange={handleFormChange}
            placeholder="Ad Soyad"
            required
          />
          {validation.fullName && (
            <div className="text-red-500 text-sm col-span-1 md:col-span-2">
              {validation.fullName}
            </div>
          )}
          <input
            className="border p-2 rounded"
            name="phone"
            value={form.phone}
            onChange={handleFormChange}
            placeholder="5441234567 (Başında 0 olmadan)"
            required
            maxLength={10}
          />
          {validation.phone && (
            <div className="text-red-500 text-sm col-span-1 md:col-span-2">
              {validation.phone}
            </div>
          )}
          <input
            className="border p-2 rounded"
            name="city"
            value={form.city}
            onChange={handleFormChange}
            placeholder="İl"
            required
          />
          {validation.city && (
            <div className="text-red-500 text-sm col-span-1 md:col-span-2">
              {validation.city}
            </div>
          )}
          <input
            className="border p-2 rounded"
            name="state"
            value={form.state}
            onChange={handleFormChange}
            placeholder="İlçe"
          />
          <input
            className="border p-2 rounded"
            name="country"
            value={form.country}
            onChange={handleFormChange}
            placeholder="Ülke"
          />
          <input
            className="border p-2 rounded"
            name="zipCode"
            value={form.zipCode}
            onChange={handleFormChange}
            placeholder="Posta Kodu"
          />
          <input
            className="border p-2 rounded col-span-1 md:col-span-2"
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Adres Başlığı (Ev, İş vb.)"
            required
          />
          {validation.title && (
            <div className="text-red-500 text-sm col-span-1 md:col-span-2">
              {validation.title}
            </div>
          )}
          <textarea
            className="border p-2 rounded col-span-1 md:col-span-2"
            name="address"
            value={form.address}
            onChange={handleFormChange}
            placeholder="Adres"
            required
          />
          {validation.address && (
            <div className="text-red-500 text-sm col-span-1 md:col-span-2">
              {validation.address}
            </div>
          )}
          <button
            type="submit"
            className="bg-black text-white rounded px-4 py-2 col-span-1 md:col-span-2 mt-2 hover:bg-gray-800"
            disabled={saving}
          >
            {saving ? "Kaydediliyor..." : editMode ? "Kaydet" : "Ekle"}
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Modal>
    </div>
  );
}
