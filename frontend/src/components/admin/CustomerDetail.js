import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrders } from "../../services/orderService";
import { getUsers } from "../../services/userService";
import { User2, Mail, Calendar, ShoppingBag, CreditCard } from "lucide-react";

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const users = await getUsers();
      const user = users.find((u) => u._id === id);
      setCustomer(user);
      const allOrders = await getOrders();
      setOrders(allOrders.filter((o) => o.user?._id === id));
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>;
  }
  if (!customer) {
    return <div className="p-8">Müşteri bulunamadı</div>;
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lastOrder =
    orders.length > 0
      ? orders.reduce((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? a : b
        )
      : null;

  const statusBadge = (status) => {
    const map = {
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      shipped: "bg-blue-100 text-blue-700",
      processing: "bg-yellow-100 text-yellow-700",
      pending: "bg-gray-100 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">
        ← Geri
      </button>
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <User2 className="w-12 h-12 text-gray-400" />
          </div>
          <div className="text-xl font-bold mb-1">{customer.name}</div>
          <div className="flex items-center text-gray-600 mb-1">
            <Mail className="w-4 h-4 mr-1" />
            {customer.email}
          </div>
          <div className="flex items-center text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            Kayıt: {new Date(customer.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-600 mb-1">
            <ShoppingBag className="w-4 h-4 mr-1" />
            Toplam Sipariş: {orders.length}
          </div>
          <div className="flex items-center text-gray-600 mb-1">
            <CreditCard className="w-4 h-4 mr-1" />
            Toplam Harcama: ₺{totalSpent.toLocaleString("tr-TR")}
          </div>
          {lastOrder && (
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              Son Sipariş: {new Date(lastOrder.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2">Sipariş Geçmişi</h2>
          {orders.length === 0 ? (
            <div className="text-gray-500">Bu müşteriye ait sipariş yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Sipariş No</th>
                    <th className="pb-2">Tarih</th>
                    <th className="pb-2">Toplam</th>
                    <th className="pb-2">Durum</th>
                    <th className="pb-2">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b last:border-0">
                      <td className="py-2">
                        {order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        ₺{(order.totalAmount || 0).toLocaleString("tr-TR")}
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
