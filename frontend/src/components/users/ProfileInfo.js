import React, { useState } from "react";
import ChangePassword from "./ChangePassword";

const ProfileInfo = ({ user, onEdit, onChangePassword }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(formData);
  };

  const handlePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) return;
    onChangePassword(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold mb-8 text-center">Profil Bilgileri</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 focus:border-black focus:ring-black px-3 py-2 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Soyad
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 focus:border-black focus:ring-black px-3 py-2 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 focus:border-black focus:ring-black px-3 py-2 bg-gray-50"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-black rounded text-base font-medium text-black bg-white hover:bg-black hover:text-white transition"
        >
          Güncelle
        </button>
      </form>
      <h3 className="text-xl font-semibold mt-10 mb-4 text-center">
        Şifre Değiştir
      </h3>
      <form className="space-y-6" onSubmit={handlePassword}>
        <ChangePassword formData={formData} onChange={handleChange} />
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-black rounded text-base font-medium text-black bg-white hover:bg-black hover:text-white transition"
        >
          Şifreyi Değiştir
        </button>
      </form>
    </div>
  );
};

export default ProfileInfo;
