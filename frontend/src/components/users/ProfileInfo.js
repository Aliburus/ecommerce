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
    <div className="bg-white rounded-xl shadow-sm p-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ad</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Soyad
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Güncelle
        </button>
      </form>

      <form className="space-y-6 mt-8" onSubmit={handlePassword}>
        <ChangePassword formData={formData} onChange={handleChange} />
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Şifreyi Değiştir
        </button>
      </form>
    </div>
  );
};

export default ProfileInfo;
