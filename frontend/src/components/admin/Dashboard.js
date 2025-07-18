import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { getOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getUsers } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { updateProduct } from "../../services/productService";
import { toast } from "react-hot-toast";
import { getBestSellingProducts } from "../../services/productService";
import { getBestSellingCategories } from "../../services/categoryService";
import { statusToText, getStatusBadgeClass } from "./statusUtils";

// Status'a göre renk döndüren fonksiyon
function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "text-yellow-600";
    case "processing":
      return "text-blue-600";
    case "shipped":
      return "text-purple-600";
    case "delivered":
      return "text-green-600";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [],
    lowStockProducts: [],
  });

  const [loading, setLoading] = useState(true);
  const [editProductModal, setEditProductModal] = useState({
    open: false,
    product: null,
  });
  const [editProductForm, setEditProductForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
    stock: "",
    category: "",
    sku: "",
    gender: "Kadın",
    variants: [{ size: "", stock: "" }],
  });

  const [bestProducts, setBestProducts] = useState([]);
  const [bestCategories, setBestCategories] = useState([]);

  const navigate = useNavigate();

  // En Çok Satılan Ürünler Slider State
  const [productPage, setProductPage] = useState(0);
  const productsPerPage = 5;
  const totalProductPages = Math.ceil(bestProducts.length / productsPerPage);
  const pagedProducts = bestProducts.slice(
    productPage * productsPerPage,
    (productPage + 1) * productsPerPage
  );

  useEffect(() => {
    fetchDashboardData();
    fetchBestSellers();
  }, []);

  useEffect(() => {
    console.log("Best Products:", bestProducts);
    console.log("Best Categories:", bestCategories);
  }, [bestProducts, bestCategories]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [orders, products, users] = await Promise.all([
        getOrders(),
        getProducts(),
        getUsers(),
      ]);

      // Toplam gelir hesapla
      const totalRevenue = orders.reduce((sum, order) => {
        if (order.status !== "cancelled") {
          return sum + (order.totalAmount || 0);
        }
        return sum;
      }, 0);

      // Son 5 sipariş
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Stok durumu kritik ürünler (stok < 10)
      const lowStockProducts = products
        .filter((product) => {
          // Varyantları olan ürünler için varyant stok kontrolü
          if (product.variants && product.variants.length > 0) {
            return product.variants.some((variant) => variant.stock < 10);
          }
          // Varyantı olmayan ürünler için genel stok kontrolü
          return product.stock < 10;
        })
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: users.length,
        recentOrders,
        lowStockProducts,
      });
    } catch (error) {
      console.error("Dashboard verileri alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const [products, categories] = await Promise.all([
        getBestSellingProducts(),
        getBestSellingCategories(),
      ]);
      setBestProducts(products);
      setBestCategories(categories);
    } catch (err) {}
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleProductClick = (product) => {
    const images = (product.images || []).map((img) => {
      if (typeof img === "string") return img;
      if (img && img.url) {
        return img.url.startsWith("http")
          ? img.url
          : `${process.env.REACT_APP_API_URL || ""}${img.url}`;
      }
      return "";
    });

    let variants = [{ size: "", stock: "" }];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      variants = product.variants.map((v) => ({
        size: v.size || "",
        stock: v.stock || "",
      }));
    }
    const totalStock = variants.reduce(
      (sum, v) => sum + (parseInt(v.stock) || 0),
      0
    );

    setEditProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      images,
      stock: totalStock,
      category: product.category?._id || product.category,
      sku: totalStock.toString(),
      gender: product.gender || "Kadın",
      variants,
    });

    setEditProductModal({ open: true, product });
  };

  const handleEditVariantChange = (idx, field, value) => {
    setEditProductForm((prev) => {
      const updated = prev.variants ? [...prev.variants] : [];
      updated[idx][field] = value;
      const totalStock = updated.reduce(
        (sum, v) => sum + (parseInt(v.stock) || 0),
        0
      );
      return {
        ...prev,
        variants: updated,
        stock: totalStock,
        sku: totalStock.toString(),
      };
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editProductForm.name);
      formData.append("price", editProductForm.price);
      formData.append("description", editProductForm.description);
      formData.append("category", editProductForm.category);
      formData.append("gender", editProductForm.gender);

      const totalStock = editProductForm.variants.reduce(
        (sum, v) => sum + (parseInt(v.stock) || 0),
        0
      );
      formData.append("stock", totalStock);
      formData.append("sku", totalStock.toString());

      const filteredVariants = editProductForm.variants.filter(
        (v) => v.size && v.stock !== undefined && v.stock !== ""
      );
      formData.append("variants", JSON.stringify(filteredVariants));

      await updateProduct(editProductModal.product._id, formData);
      toast.success("Ürün başarıyla güncellendi!");
      setEditProductModal({ open: false, product: null });
      await fetchDashboardData();
    } catch (error) {
      console.error("Ürün güncellenirken hata:", error);
      toast.error(
        error.response?.data?.message || "Ürün güncellenirken bir hata oluştu!"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold mt-1">
                ₺{stats.totalRevenue.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Sipariş</p>
              <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Müşteri</p>
              <p className="text-2xl font-bold mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* En Çok Satılanlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className="bg-white p-6 rounded-2xl shadow-sm custom-scrollbar"
          style={{
            maxHeight: "340px",
            minHeight: "120px",
            overflowY: "auto",
            marginBottom: "24px",
          }}
        >
          <h2 className="text-lg font-semibold mb-4">En Çok Satılan Ürünler</h2>
          {bestProducts.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Şu anda en çok satan ürün yok
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {bestProducts.slice(0, 6).map((p, idx) => (
                <div
                  key={p._id}
                  className="group bg-gray-50 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-lg transition cursor-pointer relative border border-gray-100 hover:border-blue-500"
                  onClick={() => navigate(`/urun/${p._id}`)}
                >
                  <img
                    src={
                      p.images?.[0]?.url?.startsWith("http")
                        ? p.images?.[0]?.url
                        : `${
                            process.env.REACT_APP_API_URL ||
                            "http://localhost:5000"
                          }${p.images?.[0]?.url}`
                    }
                    alt={p.name}
                    className="w-20 h-20 object-cover rounded-lg mb-2 border-2 border-white group-hover:scale-105 transition"
                  />
                  <div className="font-semibold text-center text-sm line-clamp-2 mb-1 text-black group-hover:text-blue-600">
                    {p.name}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {p.soldCount} satış
                    </span>
                    <span className="text-xs text-gray-500">₺{p.price}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-white rounded-full shadow px-2 py-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalProductPages > 1 && (
            <div className="flex justify-center mt-2 space-x-1">
              {Array.from({ length: totalProductPages }).map((_, idx) => (
                <span
                  key={idx}
                  className={`inline-block w-2 h-2 rounded-full ${
                    idx === productPage ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div
          className="bg-white p-6 rounded-2xl shadow-sm custom-scrollbar"
          style={{
            maxHeight: "340px",
            minHeight: "120px",
            overflowY: "auto",
            marginBottom: "24px",
          }}
        >
          <h2 className="text-lg font-semibold mb-4">
            En Çok Satılan Kategoriler
          </h2>
          {bestCategories.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Şu anda en çok satan kategori yok
            </div>
          ) : (
            <ul className="space-y-2">
              {bestCategories.map((c) => (
                <li key={c._id} className="flex items-center gap-4">
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {c.soldCount} satış
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Son Siparişler ve Stok Durumu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Son Siparişler */}
        <div
          className="bg-white p-6 rounded-2xl shadow-sm custom-scrollbar"
          style={{
            maxHeight: "340px",
            minHeight: "120px",
            overflowY: "auto",
            marginBottom: "24px",
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Son Siparişler</h2>
          <div className="space-y-4">
            {stats.recentOrders.slice(0, 50).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => handleViewOrder(order._id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Sipariş #{order._id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ₺{order.totalAmount.toLocaleString("tr-TR")}
                  </p>
                  <p
                    className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {statusToText(order.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kritik Stok */}
        <div
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 custom-scrollbar"
          style={{
            maxHeight: "340px",
            minHeight: "120px",
            overflowY: "auto",
            marginBottom: "24px",
          }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Kritik Stok
          </h2>
          <div className="space-y-4">
            {stats.lowStockProducts.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                Şu anda kritik stok yok
              </div>
            ) : (
              stats.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${
                        process.env.REACT_APP_API_URL || "http://localhost:5000"
                      }${product.images[0]?.url}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <div className="mt-1 space-y-1">
                        {product.variants
                          .filter((v) => v.stock < 10)
                          .map((variant) => (
                            <p
                              key={variant.size}
                              className="text-sm text-red-600"
                            >
                              {variant.size} beden: {variant.stock} adet
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₺{product.price.toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stok Güncelleme Modalı */}
      {editProductModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() =>
                setEditProductModal({ open: false, product: null })
              }
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">Stok Güncelle</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="mb-4">
                <h3 className="font-medium mb-2">
                  {editProductModal.product.name}
                </h3>
                <div className="space-y-3">
                  {editProductForm.variants &&
                    editProductForm.variants.map((variant, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="flex-1 bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm font-medium">
                            {variant.size}
                          </span>
                        </div>
                        <input
                          type="number"
                          placeholder="Stok"
                          value={variant.stock}
                          onChange={(e) =>
                            handleEditVariantChange(
                              idx,
                              "stock",
                              e.target.value
                            )
                          }
                          className="w-24 border px-2 py-1 rounded text-sm"
                          required
                        />
                      </div>
                    ))}
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 w-full"
              >
                Stok Güncelle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
