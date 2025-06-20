import React, { useState, useEffect } from "react";
import {
  User,
  // Settings,
  Tag,
  Heart,
  LogOut,
  Package,
  Bell,
  Shield,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileInfo from "../../components/users/ProfileInfo";
import Orders from "../../components/users/Orders";

import Notifications from "../../components/users/Notifications";

import Addresses from "../../components/users/Addresses";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/userService";
import { getUserDiscounts } from "../../services/discountService";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    { id: "discounts", icon: Tag, label: "İndirimlerim" },
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

                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-6"
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                >
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
            {activeTab === "discounts" && <DiscountList />}
          </div>
        </div>
      </div>
    </div>
  );
};

// İndirimlerim bileşeni
const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const data = await getUserDiscounts();
        setDiscounts(data);
      } catch (err) {
        setError("İndirimler alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!discounts.length) return <div>Aktif indirim kuponunuz yok.</div>;

  // Tarih formatlama fonksiyonu
  const formatDateTR = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold mb-4">İndirimlerim</h2>
      <ul className="space-y-4">
        {discounts.map((d) => (
          <li
            key={d._id}
            className="border p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          >
            <div className="flex-1">
              {/* Kod veya kategori etiketi */}
              {d.isCategoryDiscount ? (
                <div className="font-semibold text-base text-green-700 bg-green-50 px-2 py-1 rounded inline-block mb-1">
                  Kategori İndirimi
                  {d.categoryId && d.categoryId.name && (
                    <span className="ml-2 text-xs text-green-900">
                      ({d.categoryId.name})
                    </span>
                  )}
                </div>
              ) : (
                d.code && (
                  <div className="font-mono text-base font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                    {d.code}
                  </div>
                )
              )}
              {/* Açıklama */}
              {d.description && (
                <div className="text-gray-700 text-sm mb-1">
                  {d.description}
                </div>
              )}
              {/* İndirim tipi */}
              <div className="text-xs text-gray-600 mb-1">
                {d.type === "percentage"
                  ? `%${d.value} indirim`
                  : `${d.value} TL indirim`}
              </div>
              {/* Kategori indirimi değilse min alışveriş göster */}
              {!d.isCategoryDiscount && d.minPurchaseAmount > 0 && (
                <div className="text-xs text-gray-500">
                  Min. Alışveriş: {d.minPurchaseAmount} TL
                  {d.maxDiscountAmount
                    ? `, Maks: ${d.maxDiscountAmount} TL`
                    : ""}
                </div>
              )}
            </div>
            <div className="mt-2 md:mt-0 text-xs text-gray-500 text-right min-w-[180px]">
              Geçerlilik:
              <br />
              {formatDateTR(d.startDate)} - {formatDateTR(d.endDate)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
