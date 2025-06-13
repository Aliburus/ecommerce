import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Settings,
  BarChart,
  Mail,
  Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../../components/admin/Dashboard";
import Orders from "../../components/admin/Orders";
import Products from "../../components/admin/Products";
import Collections from "../../components/admin/Collections";
import Customers from "../../components/admin/Customers";
import SettingsPage from "../../components/admin/Settings";
import EmailCampaings from "../../components/admin/EmailCampaings";
import Discounts from "../../components/admin/Discounts";
import { toast } from "react-hot-toast";

import {
  getCollections,
  createCollection,
  deleteCollection,
  updateCollection,
} from "../../services/collectionService";
import {
  getProducts,
  deleteProduct,
  updateProduct,
  createProduct,
} from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getUsers } from "../../services/userService";
import { getOrders, updateOrderStatus } from "../../services/orderService";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../../services/adminSettingsService";

function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [adminSettings, setAdminSettings] = useState({
    notificationSettings: { newOrder: true, stockAlert: true },
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "collections") {
      fetchCollections();
      fetchProducts();
    }
    if (activeTab === "customers") {
      fetchUsers();
      fetchOrders();
    }
    if (activeTab === "settings") {
      fetchAdminSettings();
    }
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (err) {
      console.error("Koleksiyonlar alınamadı:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      const baseUrl = process.env.REACT_APP_API_URL || "";
      const fixedProducts = data.map((product) => ({
        ...product,
        images: (product.images || []).map((img) => {
          if (!img) return "";
          if (typeof img === "string") return img;
          if (img.url) {
            return img.url.startsWith("http")
              ? img.url
              : `${baseUrl}${img.url}`;
          }
          return "";
        }),
      }));
      setProducts(fixedProducts);
    } catch (err) {
      console.error("Ürünler alınamadı:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Kategoriler alınamadı:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Kullanıcılar alınamadı:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Siparişler alınamadı:", err);
    }
  };

  const fetchAdminSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await getAdminSettings();
      setAdminSettings(data);
    } catch (err) {
      console.error("Ayarlar alınamadı:", err);
    }
    setSettingsLoading(false);
  };

  const handleSettingsSwitch = async (key) => {
    const newSettings = {
      ...adminSettings.notificationSettings,
      [key]: !adminSettings.notificationSettings[key],
    };
    setAdminSettings((prev) => ({
      ...prev,
      notificationSettings: newSettings,
    }));
    await updateAdminSettings(
      newSettings,
      adminSettings.storeName,
      adminSettings.contactEmail
    );
  };

  const handleStoreInputChange = (e) => {
    const { name, value } = e.target;
    setAdminSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoreSave = async () => {
    try {
      await updateAdminSettings(
        adminSettings.notificationSettings,
        adminSettings.storeName,
        adminSettings.contactEmail,
        adminSettings.shippingLimit,
        adminSettings.shippingFee
      );
      toast.success("Ayarlar başarıyla güncellendi");
    } catch (error) {
      toast.error("Ayarlar güncellenirken bir hata oluştu");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Ürün silinsin mi?")) return;
    try {
      await deleteProduct(productId);
      fetchProducts();
    } catch (err) {
      console.error("Ürün silinemedi:", err);
    }
  };

  const handleDeleteCollection = async (colId) => {
    if (!window.confirm("Koleksiyon silinsin mi?")) return;
    try {
      await deleteCollection(colId);
      fetchCollections();
    } catch (err) {
      console.error("Koleksiyon silinemedi:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, note) => {
    try {
      await updateOrderStatus(orderId, newStatus, note);
      fetchOrders();
    } catch (error) {
      console.error("Sipariş durumu güncellenemedi:", error);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      await updateProduct(productId, updatedData);
      await fetchProducts(); // Ürünleri yeniden yükle
    } catch (error) {
      console.error("Ürün güncellenirken hata:", error);
      throw error;
    }
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders", icon: Package, label: "Siparişler" },
    { id: "products", icon: ShoppingBag, label: "Ürünler" },
    { id: "collections", icon: BarChart, label: "Koleksiyonlar" },
    { id: "customers", icon: Users, label: "Müşteriler" },
    { id: "discounts", icon: Percent, label: "İndirimler" },
    { id: "campaigns", icon: Mail, label: "Email Kampanyaları" },
    { id: "settings", icon: Settings, label: "Ayarlar" },
  ];

  const handleMenuClick = (id) => {
    setActiveTab(id);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "orders":
        return (
          <Orders
            orders={orders}
            onViewOrder={handleViewOrder}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        );
      case "products":
        return (
          <Products
            products={products}
            categories={categories}
            onDelete={handleDeleteProduct}
            onUpdate={handleUpdateProduct}
          />
        );
      case "collections":
        return (
          <Collections
            collections={collections}
            products={products}
            onDelete={handleDeleteCollection}
          />
        );
      case "customers":
        return <Customers users={users} orders={orders} />;
      case "discounts":
        return <Discounts />;
      case "campaigns":
        return <EmailCampaings />;
      case "settings":
        return (
          <SettingsPage
            adminSettings={adminSettings}
            settingsLoading={settingsLoading}
            onSettingsSwitch={handleSettingsSwitch}
            onStoreInputChange={handleStoreInputChange}
            onStoreSave={handleStoreSave}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white min-h-screen p-4">
          <div className="flex items-center space-x-2 px-4 py-6 border-b border-gray-200">
            <LayoutDashboard className="h-8 w-8 text-black" />
            <span className="text-black text-xl font-bold">LUXE Admin</span>
          </div>

          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-gray-100 text-black"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Admin;
