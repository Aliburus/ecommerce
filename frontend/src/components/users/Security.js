import React from "react";

const Security = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">Güvenlik</h3>
      <ul className="space-y-4">
        <li className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-semibold">İki Adımlı Doğrulama</div>
            <div className="text-gray-500 text-sm">
              Hesabınızı daha güvenli hale getirin.
            </div>
          </div>
          <button className="text-blue-600 hover:underline">Aktif Et</button>
        </li>
        <li className="flex items-center justify-between p-4 border rounded">
          <div>
            <div className="font-semibold">Şifreyi Güncelle</div>
            <div className="text-gray-500 text-sm">
              Şifrenizi düzenli olarak değiştirin.
            </div>
          </div>
          <button className="text-blue-600 hover:underline">Değiştir</button>
        </li>
      </ul>
    </div>
  );
};

export default Security;
