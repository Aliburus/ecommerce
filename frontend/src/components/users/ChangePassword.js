import React from "react";

const ChangePassword = ({ formData, onChange }) => (
  <div className="border-t pt-6">
    <h3 className="text-lg font-medium mb-4">Şifre Değiştir</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mevcut Şifre
        </label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Yeni Şifre
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Yeni Şifre (Tekrar)
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
);

export default ChangePassword;
