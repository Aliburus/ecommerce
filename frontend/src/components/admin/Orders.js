import React, { useState, useMemo, useEffect } from "react";
import { Filter, Download, X, Edit2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../services/orderService";
import { statusToText, getStatusBadgeClass } from "./statusUtils";

function Orders({ onViewOrder, onUpdateStatus }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNote, setStatusNote] = useState("");

  const fetchOrders = async () => {
    const data = await getOrders(search);
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const statusOptions = useMemo(
    () => [
      {
        value: "pending",
        label: "Beklemede",
        color: "bg-gray-100 text-gray-800",
      },
      {
        value: "processing",
        label: "İşleniyor",
        color: "bg-yellow-100 text-yellow-800",
      },
      {
        value: "shipped",
        label: "Kargoda",
        color: "bg-blue-100 text-blue-800",
      },
      {
        value: "delivered",
        label: "Teslim Edildi",
        color: "bg-green-100 text-green-800",
      },
      {
        value: "cancelled",
        label: "İptal Edildi",
        color: "bg-red-100 text-red-800",
      },
    ],
    []
  );

  const getStatusLabel = (status) => statusToText(status);

  const getStatusColor = useMemo(
    () => (status) => {
      return (
        statusOptions.find((opt) => opt.value === status)?.color ||
        "bg-gray-100 text-gray-800"
      );
    },
    [statusOptions]
  );

  const handleStatusChange = (orderId, currentStatus) => {
    setSelectedOrder({ id: orderId, status: currentStatus });
    setStatusNote("");
  };

  const handleStatusUpdate = async () => {
    if (selectedOrder) {
      await onUpdateStatus(selectedOrder.id, selectedOrder.status, statusNote);
      setSelectedOrder(null);
      setStatusNote("");
      fetchOrders();
    }
  };

  const handleViewOrderDetail = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Siparişleri sıralama: Teslim edilenler en sonda, diğerleri en yeni en üstte, kendi içlerinde tarihe göre
  const sortedOrders = [
    ...orders
      .filter((o) => o.status !== "delivered")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    ...orders
      .filter((o) => o.status === "delivered")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Siparişler</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sipariş ID veya Email ile ara..."
              className="px-4 py-2 border rounded-lg pl-10"
            />
            <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5" />
            <span>Filtrele</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5" />
            <span>Dışa Aktar</span>
          </button>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Durum Güncelle</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Durum
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    setSelectedOrder({
                      ...selectedOrder,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Not
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Durum değişikliği hakkında not ekleyin..."
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4">Sipariş No</th>
              <th className="pb-4">Tarih</th>
              <th className="pb-4">Müşteri</th>
              <th className="pb-4">Ürünler</th>
              <th className="pb-4">Toplam</th>
              <th className="pb-4">Durum</th>
              <th className="pb-4">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-500 py-10 text-lg"
                >
                  Şu an sipariş yok
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr key={order._id} className="border-b last:border-0">
                  <td className="py-4">{order._id.slice(-6).toUpperCase()}</td>
                  <td className="py-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">{order.user?.name || "-"}</td>
                  <td className="py-4">{order.items?.length || 0} ürün</td>
                  <td className="py-4">
                    ₺{(order.totalAmount || 0).toLocaleString("tr-TR")}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, order.status)
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleViewOrderDetail(order._id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(Orders);
