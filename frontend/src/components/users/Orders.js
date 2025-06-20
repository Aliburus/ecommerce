import React, { useEffect, useState } from "react";
import { getMyOrders, getOrderById } from "../../services/orderService";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { getStatusBadgeClass, statusToText } from "../admin/statusUtils";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [openOrderId, setOpenOrderId] = useState(null);
  const navigate = useNavigate();

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

  const handleOrderClick = async (orderId) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await getOrderById(orderId);
      setSelectedOrder(data);
    } catch (err) {
      setDetailError("Sipariş detayı alınamadı");
    }
    setDetailLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  if (selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8 ">
        <button
          className="mb-4 text-blue-600 hover:underline"
          onClick={() => setSelectedOrder(null)}
        >
          &larr; Siparişlerime Dön
        </button>
        <h2 className="text-2xl font-bold mb-6">Sipariş Detayı</h2>
        <div className="mb-4">
          <span className="font-semibold">Sipariş No:</span> #
          {selectedOrder._id.slice(-6)}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Tarih:</span>{" "}
          {new Date(selectedOrder.createdAt).toLocaleString("tr-TR")}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Durum:</span> {selectedOrder.status}
        </div>
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Ürünler</h3>
          <div className="space-y-4">
            {selectedOrder.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 border-b pb-2"
              >
                <Link
                  to={`/urun/${item.product?._id || item.product}`}
                  className="group"
                >
                  <img
                    src={`${process.env.REACT_APP_API_URL}${
                      item.product?.images?.[0]?.url || ""
                    }`}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded group-hover:opacity-80 transition"
                  />
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/urun/${item.product?._id}`}
                    className="font-medium hover:underline"
                  >
                    {item.product?.name}
                  </Link>
                  <div className="text-sm text-gray-600">
                    Adet: {item.quantity}
                  </div>
                  {item.size && (
                    <div className="text-sm text-gray-600">
                      Beden: {item.size}
                    </div>
                  )}
                </div>
                <div className="font-semibold">{item.product?.price} ₺</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Teslimat Adresi</h3>
          <div>
            {selectedOrder.shippingAddress ? (
              <div>
                <div>{selectedOrder.shippingAddress.fullName}</div>
                <div>{selectedOrder.shippingAddress.address}</div>
                <div>
                  {selectedOrder.shippingAddress.city}
                  {selectedOrder.shippingAddress.state
                    ? "/" + selectedOrder.shippingAddress.state
                    : ""}
                </div>
                <div>{selectedOrder.shippingAddress.country}</div>
                <div>{selectedOrder.shippingAddress.zipCode}</div>
                <div>{selectedOrder.shippingAddress.phone}</div>
              </div>
            ) : (
              <div>Adres bilgisi bulunamadı</div>
            )}
          </div>
        </div>
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Fatura Bilgisi</h3>
          <div>Fatura bilgisi (statik)</div>
        </div>
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Ödeme Bilgisi</h3>
          <div>Ödeme bilgisi (statik)</div>
        </div>
        <div className="text-right font-bold text-lg">
          Toplam Tutar: {selectedOrder.totalAmount} ₺
        </div>
        {detailLoading && <LoadingSpinner />}
        {detailError && <div className="text-red-500">{detailError}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto  space-y-6">
      <h3 className="text-3xl font-bold mb-8 text-center text-black tracking-tight">
        Siparişlerim
      </h3>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12 text-lg">
          Hiç siparişiniz yok.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6">
                <div className="flex flex-1 flex-col md:flex-row md:items-center gap-8">
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <span className="text-xs text-gray-500 font-medium">
                      Sipariş Tarihi
                    </span>
                    <span className="text-base text-black font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")} -{" "}
                      {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <span className="text-xs text-gray-500 font-medium">
                      Sipariş Özeti
                    </span>
                    <span className="text-base text-black font-semibold">
                      {order.items.length} Teslimat,{" "}
                      {order.items.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      )}{" "}
                      Ürün
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <span className="text-xs text-gray-500 font-medium">
                      Alıcı
                    </span>
                    <span className="text-base text-black font-semibold">
                      {order.shippingAddress?.fullName || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[100px]">
                    <span className="text-xs text-gray-500 font-medium">
                      Tutar
                    </span>
                    <span className="text-base font-bold text-black">
                      {order.totalAmount.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      TL
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-4 md:mt-0">
                  <button
                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold shadow-sm transition-all"
                    onClick={() =>
                      setOpenOrderId(
                        openOrderId === order._id ? null : order._id
                      )
                    }
                  >
                    {openOrderId === order._id ? "Kapat" : "Sipariş Detayı"}
                  </button>
                </div>
              </div>
              {openOrderId === order._id && (
                <div className="bg-gray-50 rounded-b-xl border-t border-gray-200 p-6 flex flex-col gap-6 animate-fade-in">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`font-semibold text-base px-3 py-1 rounded-full ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {statusToText(order.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center mb-6">
                      {order.items.map((item) => (
                        <div
                          key={item.product?._id || item.product}
                          className="flex flex-col items-center gap-2"
                        >
                          <Link
                            to={`/urun/${item.product?._id || item.product}`}
                            className="group"
                          >
                            <img
                              src={`${process.env.REACT_APP_API_URL}${
                                item.product?.images?.[0]?.url || ""
                              }`}
                              alt={item.product?.name}
                              className="w-20 h-20 object-cover rounded shadow border group-hover:opacity-80 transition"
                            />
                          </Link>
                          <span className="text-xs text-gray-700 text-center max-w-[80px] truncate">
                            {item.product?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="font-semibold mb-2 text-gray-800">
                          Teslimat Adresi
                        </div>
                        {order.shippingAddress ? (
                          <div className="text-sm text-gray-700 space-y-1">
                            <div>{order.shippingAddress.fullName}</div>
                            <div>{order.shippingAddress.address}</div>
                            <div>
                              {order.shippingAddress.city}
                              {order.shippingAddress.state
                                ? "/" + order.shippingAddress.state
                                : ""}
                            </div>
                            <div>{order.shippingAddress.country}</div>
                            <div>{order.shippingAddress.zipCode}</div>
                            <div>{order.shippingAddress.phone}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Adres bilgisi bulunamadı
                          </div>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="font-semibold mb-2 text-gray-800">
                          Fatura Bilgisi
                        </div>
                        <div className="text-sm text-gray-700">
                          Bireysel Fatura
                          <br />
                          Ali Buruş
                          <br />
                          Türkiye
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="font-semibold mb-2 text-gray-800">
                          Ödeme Bilgisi
                        </div>
                        <div className="text-sm text-gray-700">
                          Kredi Kartı ile ödendi
                          <br />
                          **** **** **** 1234
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
