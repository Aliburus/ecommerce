import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Settings,
  BarChart,
  Bell,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
} from "lucide-react";

import {
  getCollections,
  createCollection,
  addProductToCollection,
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

function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collections, setCollections] = useState([]);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    image: "",
    products: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showProductForm, setShowProductForm] = useState({});
  const [productIdInput, setProductIdInput] = useState({});
  const [productAddError, setProductAddError] = useState("");
  const [productAddSuccess, setProductAddSuccess] = useState("");
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, collection: null });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    image: "",
    products: [],
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
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
  const [addProductModal, setAddProductModal] = useState(false);
  const [addProductForm, setAddProductForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
    stock: "",
    category: "",
    sku: "",
    gender: "Kadın",
  });
  const [addProductFiles, setAddProductFiles] = useState([]);
  const [addProductVariants, setAddProductVariants] = useState([
    { size: "", stock: "" },
  ]);
  const [addProductError, setAddProductError] = useState("");
  const [addProductSuccess, setAddProductSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [editProductFiles, setEditProductFiles] = useState([]);

  const genderOptions = [
    { value: "Kadın", label: "Kadın" },
    { value: "Erkek", label: "Erkek" },
    { value: "Unisex", label: "Unisex" },
  ];

  useEffect(() => {
    if (activeTab === "collections") {
      fetchCollections();
      fetchProducts();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // EKLENDİ: İlk açılışta ürünleri getir
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Varyantlardaki stokların toplamını otomatik olarak genel stok alanına ve SKU alanına yaz
    const totalStock = addProductVariants.reduce(
      (sum, v) => sum + (parseInt(v.stock) || 0),
      0
    );
    setAddProductForm((prev) => ({
      ...prev,
      stock: totalStock,
      sku: totalStock.toString(),
    }));
    // eslint-disable-next-line
  }, [addProductVariants]);

  const fetchCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (err) {
      setError("Koleksiyonlar alınamadı");
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      // Her ürünün images dizisindeki url'leri tam url'ye çevir
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
      setProductsError("");
    } catch (err) {
      setProducts([]);
      setProductsError("Ürünler alınamadı veya yetkiniz yok.");
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

  const handleCollectionChange = (e) => {
    const { name, value, multiple, options } = e.target;
    if (multiple) {
      const selected = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setNewCollection({ ...newCollection, [name]: selected });
    } else {
      setNewCollection({ ...newCollection, [name]: value });
    }
  };

  const handleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createCollection({
        name: newCollection.name,
        description: newCollection.description,
        image: newCollection.image,
        products: selectedProducts,
      });
      setSuccess("Koleksiyon eklendi");
      setNewCollection({ name: "", description: "", image: "", products: [] });
      setSelectedProducts([]);
      setShowProductSelect(false);
      fetchCollections();
    } catch (err) {
      setError("Koleksiyon eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleShowProductForm = (colId) => {
    setShowProductForm((prev) => ({ ...prev, [colId]: !prev[colId] }));
    setProductAddError("");
    setProductAddSuccess("");
  };

  const handleProductIdInput = (colId, value) => {
    setProductIdInput((prev) => ({ ...prev, [colId]: value }));
  };

  const handleAddProduct = async (colId) => {
    setProductAddError("");
    setProductAddSuccess("");
    try {
      await addProductToCollection(colId, productIdInput[colId]);
      setProductAddSuccess("Ürün eklendi");
      setProductIdInput((prev) => ({ ...prev, [colId]: "" }));
      fetchCollections();
    } catch (err) {
      setProductAddError("Ürün eklenemedi");
    }
  };

  const handleDeleteCollection = async (colId) => {
    if (!window.confirm("Koleksiyon silinsin mi?")) return;
    try {
      await deleteCollection(colId);
      fetchCollections();
    } catch {
      alert("Koleksiyon silinemedi");
    }
  };

  const openEditModal = (col) => {
    setEditForm({
      name: col.name,
      description: col.description,
      image: col.image,
      products: col.products || [],
    });
    setEditModal({ open: true, collection: col });
    setEditError("");
    setEditSuccess("");
  };

  const closeEditModal = () => {
    setEditModal({ open: false, collection: null });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    try {
      await updateCollection(editModal.collection._id, editForm);
      setEditSuccess("Koleksiyon güncellendi");
      fetchCollections();
      setTimeout(() => closeEditModal(), 1000);
    } catch {
      setEditError("Güncelleme başarısız");
    }
  };

  const handleRemoveProduct = (productId) => {
    setEditForm((prev) => ({
      ...prev,
      products: prev.products.filter((id) => id !== productId),
    }));
  };

  const handleAddProductToEdit = (productId) => {
    if (!editForm.products.includes(productId)) {
      setEditForm((prev) => ({
        ...prev,
        products: [...prev.products, productId],
      }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Ürün silinsin mi?")) return;
    try {
      await deleteProduct(productId);
      fetchProducts();
    } catch {
      alert("Ürün silinemedi");
    }
  };

  const openEditProductModal = (product) => {
    // Görsel yollarını tam url olarak al
    const images = (product.images || []).map((img) => {
      if (typeof img === "string") return img;
      if (img && img.url) {
        return img.url.startsWith("http")
          ? img.url
          : `${process.env.REACT_APP_API_URL || ""}${img.url}`;
      }
      return "";
    });

    // Varyantları frontend formatına çevir
    let variants = [{ size: "", stock: "" }];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      variants = product.variants.map((v) => ({
        size: v.size || "",
        stock: v.stock || "",
      }));
    }
    // Toplam stok ve SKU hesapla
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
    setEditProductFiles([]);
    setEditProductModal({ open: true, product });
  };

  const closeEditProductModal = () => {
    setEditProductModal({ open: false, product: null });
  };

  const handleEditProductFormChange = (e) => {
    const { name, value } = e.target;
    setEditProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    try {
      // VARYANT FİLTRELEME
      const filteredVariants = editProductForm.variants.filter(
        (v) => v.size && v.stock !== undefined && v.stock !== ""
      );
      if (filteredVariants.length === 0) {
        alert("En az bir geçerli varyant girilmelidir.");
        return;
      }
      // FOTOĞRAF KONTROLÜ
      let images = editProductForm.images;
      if (editProductFiles && editProductFiles.length > 0) {
        images = editProductFiles;
      }
      if (!images || images.length < 2) {
        alert("En az 2 fotoğraf olmalı.");
        return;
      }
      // SKU toplam stok
      const totalStock = filteredVariants.reduce(
        (sum, v) => sum + (parseInt(v.stock) || 0),
        0
      );
      const updatedForm = {
        ...editProductForm,
        variants: filteredVariants,
        images,
        sku: totalStock.toString(),
        stock: totalStock,
        gender: editProductForm.gender,
      };
      await updateProduct(editProductModal.product._id, updatedForm);
      fetchProducts();
      closeEditProductModal();
    } catch {
      alert("Ürün güncellenemedi");
    }
  };

  const openAddProductModal = () => {
    setAddProductForm({
      name: "",
      price: "",
      description: "",
      images: [],
      stock: "",
      category: "",
      sku: "",
      gender: "Kadın",
    });
    setAddProductError("");
    setAddProductSuccess("");
    setAddProductModal(true);
  };

  const closeAddProductModal = () => setAddProductModal(false);

  const handleAddProductFormChange = (e) => {
    const { name, value } = e.target;
    setAddProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProductFileChange = (e) => {
    setAddProductFiles(Array.from(e.target.files));
  };

  const handleVariantChange = (idx, field, value) => {
    setAddProductVariants((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      // Toplam stok ve SKU hesapla
      const totalStock = updated.reduce(
        (sum, v) => sum + (parseInt(v.stock) || 0),
        0
      );
      setAddProductForm((form) => ({
        ...form,
        stock: totalStock,
        sku: totalStock.toString(),
      }));
      return updated;
    });
  };

  const handleAddVariant = () => {
    setAddProductVariants((prev) => [...prev, { size: "", stock: "" }]);
  };

  const handleRemoveVariant = (idx) => {
    setAddProductVariants((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setAddProductError("");
    setAddProductSuccess("");
    if (addProductFiles.length < 2) {
      setAddProductError("En az 2 resim yüklemelisiniz.");
      return;
    }
    if (!addProductForm.gender) {
      setAddProductError("Lütfen cinsiyet seçiniz.");
      return;
    }
    try {
      const totalStock = addProductVariants.reduce(
        (sum, v) => sum + (parseInt(v.stock) || 0),
        0
      );
      const formData = new FormData();
      formData.append("name", addProductForm.name);
      formData.append("price", addProductForm.price);
      formData.append("description", addProductForm.description);
      formData.append("category", addProductForm.category);
      formData.append("sku", totalStock.toString());
      formData.append("stock", totalStock);
      formData.append("gender", addProductForm.gender || "Kadın");
      // VARYANT FİLTRELEME
      const filteredVariants = addProductVariants.filter(
        (v) => v.size && v.stock !== undefined && v.stock !== ""
      );
      if (filteredVariants.length === 0) {
        setAddProductError("En az bir geçerli varyant girilmelidir.");
        return;
      }
      formData.append("variants", JSON.stringify(filteredVariants));
      addProductFiles.forEach((file) => {
        formData.append("images", file);
      });
      await createProduct(formData, true);
      setAddProductSuccess("Ürün eklendi");
      fetchProducts();
      setTimeout(() => closeAddProductModal(), 1000);
    } catch (error) {
      setAddProductError(error.response?.data?.message || "Ürün eklenemedi");
    }
  };

  const handleEditVariantChange = (idx, field, value) => {
    setEditProductForm((prev) => {
      const updated = prev.variants ? [...prev.variants] : [];
      updated[idx][field] = value;
      // Toplam stok ve SKU hesapla
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

  const handleAddEditVariant = () => {
    setEditProductForm((prev) => ({
      ...prev,
      variants: prev.variants
        ? [...prev.variants, { size: "", stock: "" }]
        : [{ size: "", stock: "" }],
    }));
  };

  const handleRemoveEditVariant = (idx) => {
    setEditProductForm((prev) => {
      const updated = prev.variants.filter((_, i) => i !== idx);
      return { ...prev, variants: updated };
    });
  };

  const handleEditProductFileChange = (e) => {
    setEditProductFiles(Array.from(e.target.files));
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders", icon: Package, label: "Siparişler" },
    { id: "products", icon: ShoppingBag, label: "Ürünler" },
    { id: "collections", icon: BarChart, label: "Koleksiyonlar" },
    { id: "customers", icon: Users, label: "Müşteriler" },
    { id: "analytics", icon: BarChart, label: "Analitik" },
    { id: "settings", icon: Settings, label: "Ayarlar" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Siparişler</h1>
              <div className="flex items-center space-x-4">
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
                    <th className="pb-4">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "#12345",
                      date: "2024-03-15",
                      customer: "Ayşe Demir",
                      products: "2 ürün",
                      total: "₺8,999",
                      status: "Tamamlandı",
                    },
                    {
                      id: "#12346",
                      date: "2024-03-14",
                      customer: "Mehmet Yılmaz",
                      products: "1 ürün",
                      total: "₺12,999",
                      status: "İşlemde",
                    },
                    {
                      id: "#12347",
                      date: "2024-03-14",
                      customer: "Zeynep Kaya",
                      products: "3 ürün",
                      total: "₺24,999",
                      status: "Kargoda",
                    },
                  ].map((order, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4">{order.id}</td>
                      <td className="py-4">{order.date}</td>
                      <td className="py-4">{order.customer}</td>
                      <td className="py-4">{order.products}</td>
                      <td className="py-4">{order.total}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            order.status === "Tamamlandı"
                              ? "bg-green-100 text-green-800"
                              : order.status === "İşlemde"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="text-blue-600 hover:text-blue-800">
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "products":
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Ürünler</h1>
              <div className="flex items-center space-x-4">
                <button
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  onClick={openAddProductModal}
                >
                  <Plus className="h-5 w-5" />
                  <span>Yeni Ürün</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 text-lg py-20">
                  Ürün bulunamadı
                </div>
              ) : (
                products.map((product) => {
                  const imgSrc =
                    product.images && product.images[0]
                      ? typeof product.images[0] === "string"
                        ? product.images[0]
                        : product.images[0].url
                      : "https://via.placeholder.com/300x200?text=No+Image";
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">
                            {product.price} ₺
                          </span>
                          <span className="text-sm text-gray-500">
                            Stok: {product.stock}
                          </span>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => openEditProductModal(product)}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ürün Düzenleme Modalı */}
            {editProductModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={closeEditProductModal}
                  >
                    X
                  </button>
                  <h2 className="text-lg font-bold mb-4">Ürünü Düzenle</h2>
                  <form onSubmit={handleEditProductSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">Ürün Adı</label>
                          <input
                            type="text"
                            name="name"
                            value={editProductForm.name}
                            onChange={handleEditProductFormChange}
                            className="w-full border px-3 py-2 rounded text-sm"
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">SKU</label>
                          <input
                            type="text"
                            name="sku"
                            value={editProductForm.sku || ""}
                            readOnly
                            className="w-full border px-3 py-2 rounded text-sm bg-gray-100"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">Fiyat</label>
                          <input
                            type="number"
                            name="price"
                            value={editProductForm.price}
                            onChange={handleEditProductFormChange}
                            className="w-full border px-3 py-2 rounded text-sm"
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">Açıklama</label>
                          <textarea
                            name="description"
                            value={editProductForm.description}
                            onChange={handleEditProductFormChange}
                            className="w-full border px-3 py-2 rounded text-sm"
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">Kategori</label>
                          <select
                            name="category"
                            value={editProductForm.category}
                            onChange={handleEditProductFormChange}
                            className="w-full border px-3 py-2 rounded text-sm"
                            required
                          >
                            <option value="">Kategori Seçin</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">Cinsiyet</label>
                          <select
                            name="gender"
                            value={editProductForm.gender}
                            onChange={handleEditProductFormChange}
                            className="w-full border px-3 py-2 rounded text-sm"
                            required
                          >
                            {genderOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">
                            Varyantlar (Beden, Stok)
                          </label>
                          {editProductForm.variants &&
                            editProductForm.variants.map((variant, idx) => (
                              <div
                                key={idx}
                                className="flex gap-2 mb-2 items-center"
                              >
                                <input
                                  type="text"
                                  placeholder="Beden"
                                  value={variant.size}
                                  onChange={(e) =>
                                    handleEditVariantChange(
                                      idx,
                                      "size",
                                      e.target.value
                                    )
                                  }
                                  className="border px-2 py-1 rounded text-sm w-1/2"
                                  required
                                />
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
                                  className="border px-2 py-1 rounded text-sm w-1/2"
                                  required
                                />
                                {editProductForm.variants.length > 1 && (
                                  <button
                                    type="button"
                                    className="text-red-600 text-lg"
                                    onClick={() => handleRemoveEditVariant(idx)}
                                  >
                                    -
                                  </button>
                                )}
                                {idx ===
                                  editProductForm.variants.length - 1 && (
                                  <button
                                    type="button"
                                    className="text-green-600 text-lg"
                                    onClick={handleAddEditVariant}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            ))}
                        </div>
                        <div className="mb-3">
                          <label className="block mb-1 text-sm">
                            Görseller (En az 2, en fazla 10)
                          </label>
                          {editProductForm.images &&
                            editProductForm.images.length > 0 && (
                              <div className="flex gap-2 mb-2">
                                {editProductForm.images.map((img, idx) => {
                                  if (!img) return null;
                                  let src = "";
                                  if (typeof img === "string") {
                                    src = img;
                                  } else if (
                                    img instanceof File ||
                                    img instanceof Blob
                                  ) {
                                    src = URL.createObjectURL(img);
                                  }
                                  return (
                                    <img
                                      key={idx}
                                      src={src}
                                      alt="Ürün görseli"
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  );
                                })}
                              </div>
                            )}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleEditProductFileChange}
                            className="w-full border px-3 py-2 rounded text-sm"
                            required={editProductForm.images.length < 2}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {editProductFiles && editProductFiles.length} dosya
                            seçildi
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 w-full mt-2"
                    >
                      Kaydet
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Ürün Ekleme Modalı */}
            {addProductModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                onClick={closeAddProductModal}
              >
                <div
                  className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative mx-2"
                  style={{ maxHeight: "95vh", overflowY: "auto" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={closeAddProductModal}
                  >
                    X
                  </button>
                  <h2 className="text-lg font-bold mb-4">Yeni Ürün Ekle</h2>
                  {addProductError && (
                    <div className="text-red-600 mb-2">{addProductError}</div>
                  )}
                  {addProductSuccess && (
                    <div className="text-green-600 mb-2">
                      {addProductSuccess}
                    </div>
                  )}
                  <form onSubmit={handleAddProductSubmit}>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Ürün Adı</label>
                      <input
                        type="text"
                        name="name"
                        value={addProductForm.name}
                        onChange={handleAddProductFormChange}
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={addProductForm.sku}
                        readOnly
                        className="w-full border px-3 py-2 rounded text-sm bg-gray-100"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Fiyat</label>
                      <input
                        type="number"
                        name="price"
                        value={addProductForm.price}
                        onChange={handleAddProductFormChange}
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Açıklama</label>
                      <textarea
                        name="description"
                        value={addProductForm.description}
                        onChange={handleAddProductFormChange}
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Kategori</label>
                      <select
                        name="category"
                        value={addProductForm.category}
                        onChange={handleAddProductFormChange}
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      >
                        <option value="">Kategori Seçin</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">Cinsiyet</label>
                      <select
                        name="gender"
                        value={addProductForm.gender}
                        onChange={handleAddProductFormChange}
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      >
                        <option value="">Cinsiyet Seçin</option>
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">
                        Varyantlar (Beden, Stok)
                      </label>
                      {addProductVariants.map((variant, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-center">
                          <input
                            type="text"
                            placeholder="Beden"
                            value={variant.size}
                            onChange={(e) =>
                              handleVariantChange(idx, "size", e.target.value)
                            }
                            className="border px-2 py-1 rounded text-sm w-1/2"
                            required
                          />
                          <input
                            type="number"
                            placeholder="Stok"
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantChange(idx, "stock", e.target.value)
                            }
                            className="border px-2 py-1 rounded text-sm w-1/2"
                            required
                          />
                          {addProductVariants.length > 1 && (
                            <button
                              type="button"
                              className="text-red-600 text-lg"
                              onClick={() => handleRemoveVariant(idx)}
                            >
                              -
                            </button>
                          )}
                          {idx === addProductVariants.length - 1 && (
                            <button
                              type="button"
                              className="text-green-600 text-lg"
                              onClick={handleAddVariant}
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mb-3">
                      <label className="block mb-1 text-sm">
                        Görseller (En az 2, en fazla 10)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddProductFileChange}
                        className="w-full border px-3 py-2 rounded text-sm"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {addProductFiles.length} dosya seçildi
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800 w-full mt-2"
                    >
                      Kaydet
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "customers":
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Müşteriler</h1>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Download className="h-5 w-5" />
                  <span>Dışa Aktar</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-4">Müşteri</th>
                    <th className="pb-4">E-posta</th>
                    <th className="pb-4">Kayıt Tarihi</th>
                    <th className="pb-4">Toplam Sipariş</th>
                    <th className="pb-4">Toplam Harcama</th>
                    <th className="pb-4">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Ayşe Demir",
                      email: "ayse@email.com",
                      date: "2024-01-15",
                      orders: 8,
                      spent: "₺45,999",
                      status: "Aktif",
                    },
                    {
                      name: "Mehmet Yılmaz",
                      email: "mehmet@email.com",
                      date: "2024-02-20",
                      orders: 3,
                      spent: "₺12,999",
                      status: "Aktif",
                    },
                    {
                      name: "Zeynep Kaya",
                      email: "zeynep@email.com",
                      date: "2024-03-01",
                      orders: 1,
                      spent: "₺24,999",
                      status: "Yeni",
                    },
                  ].map((customer, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4">{customer.name}</td>
                      <td className="py-4">{customer.email}</td>
                      <td className="py-4">{customer.date}</td>
                      <td className="py-4">{customer.orders}</td>
                      <td className="py-4">{customer.spent}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            customer.status === "Aktif"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Analitik</h1>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Download className="h-5 w-5" />
                  <span>Rapor İndir</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Satış Trendi</h3>
                <div className="h-64 flex items-end space-x-2">
                  {[65, 45, 75, 55, 85, 35, 95].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-black bg-opacity-10 hover:bg-opacity-20 transition-all cursor-pointer rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                  <span>Pzt</span>
                  <span>Sal</span>
                  <span>Çar</span>
                  <span>Per</span>
                  <span>Cum</span>
                  <span>Cmt</span>
                  <span>Paz</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Popüler Kategoriler
                </h3>
                <div className="space-y-4">
                  {[
                    { name: "Elbise", percentage: 35 },
                    { name: "Aksesuar", percentage: 28 },
                    { name: "Dış Giyim", percentage: 20 },
                    { name: "Çanta", percentage: 17 },
                  ].map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.name}</span>
                        <span>{category.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
              <div className="space-y-4">
                {[
                  {
                    action: "Yeni Sipariş",
                    description: "Ayşe D. yeni bir sipariş verdi",
                    time: "5 dakika önce",
                  },
                  {
                    action: "Stok Güncellemesi",
                    description: "Deri Ceket stoku güncellendi",
                    time: "1 saat önce",
                  },
                  {
                    action: "Yeni Müşteri",
                    description: "Zeynep K. kaydoldu",
                    time: "2 saat önce",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-black" />
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.action}</h4>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "settings":
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        value="LUXE"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İletişim E-posta
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        value="info@luxe.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Bildirim Ayarları
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Yeni sipariş bildirimleri",
                      "Stok uyarıları",
                      "Yeni müşteri kayıtları",
                      "Sistem güncellemeleri",
                    ].map((setting, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{setting}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Yedekleme ve Dışa Aktarma
                  </h3>
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Download className="h-5 w-5" />
                      <span>Veri Yedekle</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Upload className="h-5 w-5" />
                      <span>Veri Yükle</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end">
                <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        );

      case "collections":
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Koleksiyonlar</h1>
            </div>
            <form
              onSubmit={handleCollectionSubmit}
              className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-xl"
            >
              <h2 className="text-lg font-semibold mb-4">
                Yeni Koleksiyon Ekle
              </h2>
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {success && <div className="text-green-600 mb-2">{success}</div>}
              <div className="mb-4">
                <label className="block mb-1">Koleksiyon Adı</label>
                <input
                  type="text"
                  name="name"
                  value={newCollection.name}
                  onChange={handleCollectionChange}
                  className="w-full border px-4 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Açıklama</label>
                <textarea
                  name="description"
                  value={newCollection.description}
                  onChange={handleCollectionChange}
                  className="w-full border px-4 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Görsel Linki</label>
                <input
                  type="text"
                  name="image"
                  value={newCollection.image}
                  onChange={handleCollectionChange}
                  className="w-full border px-4 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Ürünler</label>
                <button
                  type="button"
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 mb-2"
                  onClick={() => setShowProductSelect((v) => !v)}
                >
                  Ürün Ekle
                </button>
                {selectedProducts.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {products
                      .filter((p) => selectedProducts.includes(p._id))
                      .map((p) => (
                        <span
                          key={p._id}
                          className="bg-gray-200 px-2 py-1 rounded text-sm"
                        >
                          {p.name}
                        </span>
                      ))}
                  </div>
                )}
                {showProductSelect && (
                  <div className="border p-2 max-h-48 overflow-y-auto bg-white shadow-lg z-10 relative">
                    {productsError && (
                      <div className="text-red-600 mb-2">{productsError}</div>
                    )}
                    {Array.isArray(products) &&
                      products.length === 0 &&
                      !productsError && (
                        <div className="text-gray-500">Ürün bulunamadı</div>
                      )}
                    {Array.isArray(products) &&
                      products.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center mb-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleProductSelect(product._id)}
                            id={`product-${product._id}`}
                            className="mr-2"
                          />
                          <label htmlFor={`product-${product._id}`}>
                            {product.name}
                          </label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                {loading ? "Ekleniyor..." : "Koleksiyon Ekle"}
              </button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <div
                  key={col._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {col.image && (
                    <img
                      src={col.image}
                      alt={col.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold">{col.name}</h3>
                    <p className="text-gray-600 mb-2">{col.description}</p>
                    <button
                      className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                      onClick={() => handleShowProductForm(col._id)}
                    >
                      Ürün Ekle
                    </button>
                    <button
                      className="mt-2 ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
                      onClick={() => openEditModal(col)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="mt-2 ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800"
                      onClick={() => handleDeleteCollection(col._id)}
                    >
                      Sil
                    </button>
                    {showProductForm[col._id] && (
                      <div className="mt-2">
                        <select
                          value={productIdInput[col._id] || ""}
                          onChange={(e) =>
                            handleProductIdInput(col._id, e.target.value)
                          }
                          className="border px-2 py-1 mr-2"
                        >
                          <option value="">Ürün Seç</option>
                          {Array.isArray(products) &&
                            products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name}
                              </option>
                            ))}
                        </select>
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded"
                          onClick={() => handleAddProduct(col._id)}
                          type="button"
                          disabled={!productIdInput[col._id]}
                        >
                          Ekle
                        </button>
                        {productAddError && (
                          <div className="text-red-600 mt-1">
                            {productAddError}
                          </div>
                        )}
                        {productAddSuccess && (
                          <div className="text-green-600 mt-1">
                            {productAddSuccess}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Düzenle Modalı */}
            {editModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={closeEditModal}
                  >
                    X
                  </button>
                  <h2 className="text-lg font-bold mb-4">
                    Koleksiyonu Düzenle
                  </h2>
                  {editError && (
                    <div className="text-red-600 mb-2">{editError}</div>
                  )}
                  {editSuccess && (
                    <div className="text-green-600 mb-2">{editSuccess}</div>
                  )}
                  <form onSubmit={handleEditSubmit}>
                    <div className="mb-4">
                      <label className="block mb-1">Koleksiyon Adı</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        className="w-full border px-4 py-2"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Açıklama</label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditFormChange}
                        className="w-full border px-4 py-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Görsel Linki</label>
                      <input
                        type="text"
                        name="image"
                        value={editForm.image}
                        onChange={handleEditFormChange}
                        className="w-full border px-4 py-2"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Ürünler</label>
                      <div className="border p-2 max-h-48 overflow-y-auto bg-white">
                        {editForm.products.length > 0 ? (
                          <div className="space-y-2">
                            {products
                              .filter((p) => editForm.products.includes(p._id))
                              .map((p) => (
                                <div
                                  key={p._id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                  <span>{p.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(p._id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Kaldır
                                  </button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            Henüz ürün eklenmemiş
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <select
                          onChange={(e) =>
                            handleAddProductToEdit(e.target.value)
                          }
                          className="border px-2 py-1 w-full"
                          value=""
                        >
                          <option value="">Ürün Ekle</option>
                          {products
                            .filter((p) => !editForm.products.includes(p._id))
                            .map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-800"
                    >
                      Kaydet
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Dashboard</h1>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>

                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Toplam Satış", value: "₺128,430", change: "+12.5%" },
                { label: "Aktif Müşteriler", value: "2,345", change: "+8.1%" },
                { label: "Yeni Siparişler", value: "15", change: "+23.4%" },
                { label: "Ortalama Sipariş", value: "₺1,540", change: "+4.7%" },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-gray-500 text-sm mb-2">{stat.label}</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <span className="text-green-500 text-sm">
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Son Siparişler</h2>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-4">Sipariş No</th>
                    <th className="pb-4">Müşteri</th>
                    <th className="pb-4">Ürün</th>
                    <th className="pb-4">Tutar</th>
                    <th className="pb-4">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "#12345",
                      customer: "Ayşe Demir",
                      product: "Klasik Siyah Elbise",
                      amount: "₺8,999",
                      status: "Tamamlandı",
                    },
                    {
                      id: "#12346",
                      customer: "Mehmet Yılmaz",
                      product: "Deri Ceket",
                      amount: "₺12,999",
                      status: "İşlemde",
                    },
                    {
                      id: "#12347",
                      customer: "Zeynep Kaya",
                      product: "Premium Saat",
                      amount: "₺24,999",
                      status: "Kargoda",
                    },
                  ].map((order, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4">{order.id}</td>
                      <td className="py-4">{order.customer}</td>
                      <td className="py-4">{order.product}</td>
                      <td className="py-4">{order.amount}</td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            order.status === "Tamamlandı"
                              ? "bg-green-100 text-green-800"
                              : order.status === "İşlemde"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black min-h-screen p-4">
          <div className="flex items-center space-x-2 px-4 py-6 border-b border-gray-700">
            <LayoutDashboard className="h-8 w-8 text-white" />
            <span className="text-white text-xl font-bold">LUXE Admin</span>
          </div>

          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-white text-black"
                    : "text-gray-300 hover:bg-gray-800"
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
