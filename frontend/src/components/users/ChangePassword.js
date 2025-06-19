import React from "react";

const ChangePassword = ({ formData, onChange }) => (
  <div className="border-t pt-6">
    <h3 className="text-lg font-medium mb-4">Şifre Değiştir</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mevcut Şifre
        </label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-gray-300 focus:border-black focus:ring-black px-3 py-2 bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Yeni Şifre
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-gray-300 focus:border-black focus:ring-black px-3 py-2 bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Yeni Şifre (Tekrar)
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={onChange}
          className="mt-1 block w-full rounded border border-gray-300 focus:border-black focus:ring-black px-3 py-2 bg-gray-50"
        />
      </div>
    </div>
  </div>
);

export default ChangePassword;
