import React, { useEffect, useState } from "react";
import { getMyOrders } from "../../services/orderService";
import { Link } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError("Siparişler alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold mb-6">Siparişlerim</h3>
      {orders.length === 0 ? (
        <div>Hiç siparişiniz yok.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürünler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.totalAmount} TL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul>
                      {order.items &&
                        order.items.map((item) => (
                          <li key={item.product?._id || item.product}>
                            <Link
                              to={`/urun/${item.product?._id || item.product}`}
                              className="text-blue-600 hover:underline"
                            >
                              {item.product?.name || "Ürün"}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
