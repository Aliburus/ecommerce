import React from "react";

const Settings = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">Ayarlar</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            E-posta Bildirimleri
          </label>
          <input type="checkbox" className="mt-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            SMS Bildirimleri
          </label>
          <input type="checkbox" className="mt-2" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
