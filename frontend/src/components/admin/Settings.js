import React, { useState } from "react";
import { Download, Upload } from "lucide-react";
import { changePassword } from "../../services/userService";
import { toast } from "react-hot-toast";

function Settings({
  adminSettings,
  settingsLoading,
  onSettingsSwitch,
  onStoreInputChange,
  onStoreSave,
}) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!adminSettings) return <div>Yükleniyor...</div>;

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }
    try {
      setPasswordLoading(true);
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success("Şifre başarıyla değiştirildi");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Şifre değiştirilemedi");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Genel Ayarlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mağaza Adı
                </label>
                <input
                  type="text"
                  name="storeName"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={adminSettings.storeName || ""}
                  onChange={onStoreInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İletişim E-posta
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={adminSettings.contactEmail || ""}
                  onChange={onStoreInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kargo Limiti (TL)
                </label>
                <input
                  type="number"
                  name="shippingLimit"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={adminSettings.shippingLimit || 500}
                  onChange={onStoreInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kargo Ücreti (TL)
                </label>
                <input
                  type="number"
                  name="shippingFee"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={adminSettings.shippingFee || 49.9}
                  onChange={onStoreInputChange}
                />
              </div>
            </div>
            <button
              className="mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              onClick={onStoreSave}
            >
              Kaydet
            </button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Şifre Değiştir</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  name="newPassword"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </button>
            </form>
          </div>

          {/* Bildirim Ayarları ve Yedekleme bölümlerini kaldırdım */}
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
