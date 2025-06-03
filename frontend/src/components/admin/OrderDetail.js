import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
} from "lucide-react";
import { getOrderById, updateOrderStatus } from "../../services/orderService";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error("Sipariş detayları alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus, statusNote);
      fetchOrderDetails();
      setStatusNote("");
    } catch (error) {
      console.error("Sipariş durumu güncellenemedi:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "processing":
        return "İşleniyor";
      case "shipped":
        return "Kargoda";
      case "delivered":
        return "Teslim Edildi";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Sipariş bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Geri Dön
        </button>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Sipariş Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Özeti */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gray-600" />
              Sipariş Özeti
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Sipariş No</span>
                <span className="font-medium">#{order._id.slice(-6)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Sipariş Tarihi</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Toplam Tutar</span>
                <span className="font-medium text-lg text-green-600">
                  ₺{order.totalAmount.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Ödeme Yöntemi</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Ürünler */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <Package className="h-5 w-5 mr-2 text-gray-600" />
              Ürünler
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={`${
                      process.env.REACT_APP_API_URL || "http://localhost:5000"
                    }${item.product.images[0]?.url}`}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.png";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} adet x ₺
                      {item.product.price.toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₺
                      {(item.product.price * item.quantity).toLocaleString(
                        "tr-TR"
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Müşteri ve Teslimat Bilgileri */}
        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Müşteri Bilgileri</h2>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{order.user.name}</p>
              <p className="text-gray-600">{order.user.email}</p>
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Teslimat Adresi</h2>
            </div>
            <div className="space-y-2 text-gray-600">
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Durum Güncelleme */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Durum Güncelle</h2>
            </div>
            <div className="space-y-4">
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Beklemede</option>
                <option value="processing">İşleniyor</option>
                <option value="shipped">Kargoda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Durum değişikliği hakkında not ekleyin..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
          </div>

          {/* Durum Geçmişi */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Truck className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Durum Geçmişi</h2>
            </div>
            <div className="space-y-4">
              {order.statusHistory?.map((history, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {getStatusLabel(history.status)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(history.date).toLocaleString()}
                    </p>
                    {history.note && (
                      <p className="text-sm text-gray-600 mt-1">
                        {history.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
