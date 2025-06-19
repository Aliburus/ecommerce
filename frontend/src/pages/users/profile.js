import React, { useState, useEffect } from "react";
import {
  User,
  // Settings,
  CreditCard,
  Heart,
  LogOut,
  Package,
  Bell,
  Shield,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileInfo from "../../components/users/ProfileInfo";
import Orders from "../../components/users/Orders";

import Notifications from "../../components/users/Notifications";

import Addresses from "../../components/users/Addresses";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/userService";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setError("Profil bilgisi alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (formData) => {
    setMessage("");
    setError("");
    try {
      await updateProfile({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
      });
      setMessage("Profil başarıyla güncellendi");
      setProfile({ ...profile, ...formData });
    } catch (err) {
      setError("Profil güncellenemedi");
    }
  };

  const handleChangePassword = async (formData) => {
    setMessage("");
    setError("");
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setMessage("Şifre başarıyla değiştirildi");
    } catch (err) {
      setError("Şifre değiştirilemedi");
    }
  };

  const menuItems = [
    { id: "profile", icon: User, label: "Profil Bilgileri" },
    { id: "orders", icon: Package, label: "Siparişlerim" },
    { id: "notifications", icon: Bell, label: "Bildirimler" },
    // { id: "settings", icon: Settings, label: "Ayarlar" },
    { id: "addresses", icon: MapPin, label: "Adreslerim" },
  ];

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center space-x-4 mb-8 pb-6 border-b">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {profile?.name || "Kullanıcı Adı"}
                  </h2>
                  <p className="text-gray-600">
                    {profile?.email || "email@example.com"}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-black text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}

                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-6">
                  <LogOut className="h-5 w-5" />
                  <span>Çıkış Yap</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {activeTab === "profile" && (
              <ProfileInfo
                user={profile}
                onEdit={handleUpdate}
                onChangePassword={handleChangePassword}
              />
            )}
            {activeTab === "orders" && <Orders />}
            {activeTab === "notifications" && <Notifications />}
            {/* {activeTab === "settings" && <SettingsTab />} */}
            {activeTab === "addresses" && <Addresses />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
