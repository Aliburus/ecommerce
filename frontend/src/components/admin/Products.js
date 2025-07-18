import React, { useState, useEffect } from "react";
import { Plus, Download, Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

function Products({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  updateProduct,
  fetchProducts,
}) {
  const [addProductModal, setAddProductModal] = useState(false);
  const [editProductModal, setEditProductModal] = useState({
    open: false,
    product: null,
  });
  const [addProductForm, setAddProductForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
    stock: "",
    category: "",
    gender: "Kadın",
    color: "",
  });
  const [editProductForm, setEditProductForm] = useState({
    name: "",
    price: "",
    description: "",
    images: [],
    stock: "",
    category: "",
    gender: "Kadın",
    variants: [{ size: "", stock: "" }],
    color: "",
  });
  const [addProductFiles, setAddProductFiles] = useState([]);
  const [editProductFiles, setEditProductFiles] = useState([]);
  const [addProductVariants, setAddProductVariants] = useState([
    { size: "", stock: "" },
  ]);
  const [addProductError, setAddProductError] = useState("");
  const [addProductSuccess, setAddProductSuccess] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const totalPages = Math.ceil(products.length / productsPerPage);
  const pagedProducts = products.slice(
    page * productsPerPage,
    (page + 1) * productsPerPage
  );

  const genderOptions = [
    { value: "Kadın", label: "Kadın" },
    { value: "Erkek", label: "Erkek" },
    { value: "Unisex", label: "Unisex" },
  ];

  const handleAddProductFormChange = (e) => {
    const { name, value } = e.target;
    setAddProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProductFormChange = (e) => {
    const { name, value } = e.target;
    setEditProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProductFileChange = (e) => {
    setAddProductFiles(Array.from(e.target.files));
  };

  const handleEditProductFileChange = (e) => {
    setEditProductFiles(Array.from(e.target.files));
  };

  const handleVariantChange = (idx, field, value) => {
    setAddProductVariants((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      const totalStock = updated.reduce(
        (sum, v) => sum + (parseInt(v.stock) || 0),
        0
      );
      setAddProductForm((form) => ({
        ...form,
        stock: totalStock,
      }));
      return updated;
    });
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
      };
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
    if (!addProductForm.category) {
      setAddProductError("Lütfen kategori seçiniz.");
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
      formData.append("stock", totalStock);
      formData.append("gender", addProductForm.gender || "Kadın");
      formData.append("color", addProductForm.color);
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
      await onAddProduct(formData);
      setAddProductSuccess("Ürün eklendi");
      setTimeout(() => setAddProductModal(false), 1000);
    } catch (error) {
      setAddProductError(error.response?.data?.message || "Ürün eklenemedi");
    }
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      await updateProduct(productId, updatedData);
      fetchProducts(); // Ürünleri yeniden yükle
      toast.success("Ürün başarıyla güncellendi");
    } catch (error) {
      console.error("Ürün güncellenirken hata:", error);
      toast.error("Ürün güncellenirken bir hata oluştu");
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
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
      formData.append("color", editProductForm.color || "");

      const totalStock = editProductForm.variants.reduce(
        (sum, v) => sum + (parseInt(v.stock) || 0),
        0
      );
      formData.append("stock", totalStock);

      const filteredVariants = editProductForm.variants.filter(
        (v) => v.size && v.stock !== undefined && v.stock !== ""
      );
      formData.append("variants", JSON.stringify(filteredVariants));

      if (editProductFiles.length > 0) {
        editProductFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      await onEditProduct(editProductModal.product._id, formData);
      toast.success("Ürün başarıyla güncellendi!");
      setEditProductModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error("Ürün güncellenirken hata:", error);
      toast.error(
        error.response?.data?.message || "Ürün güncellenirken bir hata oluştu!"
      );
    }
  };

  const openEditProductModal = (product) => {
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
      gender: product.gender || "Kadın",
      variants,
      color: product.color || "",
    });
    setEditProductFiles([]);
    setEditProductModal({ open: true, product });
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: "Örnek Ürün",
        description: "Ürün açıklaması",
        price: "100",
        stock: "50",
        category: "Kategori Adı",
        image: "https://example.com/image.jpg",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
    XLSX.writeFile(wb, "urun_sablonu.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Veri doğrulama
        const errors = [];
        data.forEach((row, index) => {
          if (!row.name) errors.push(`Satır ${index + 1}: Ürün adı gerekli`);
          if (!row.price || isNaN(row.price))
            errors.push(`Satır ${index + 1}: Geçerli fiyat gerekli`);
          if (!row.stock || isNaN(row.stock))
            errors.push(`Satır ${index + 1}: Geçerli stok gerekli`);
        });

        if (errors.length > 0) {
          setImportError(errors.join("\n"));
          return;
        }

        setImportFile(data);
        setImportError("");
      } catch (error) {
        setImportError(
          "Dosya okunamadı. Lütfen geçerli bir Excel dosyası yükleyin."
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImportSuccess("");
    setImportError("");
    let successCount = 0;
    let errorCount = 0;

    for (const product of importFile) {
      try {
        const category = categories.find((c) => c.name === product.category);
        if (!category) {
          errorCount++;
          continue;
        }

        await onAddProduct(
          new FormData({
            name: product.name,
            description: product.description || "",
            price: Number(product.price),
            stock: Number(product.stock),
            category: category._id,
            image: product.image || "",
          })
        );
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setImportSuccess(
      `${successCount} ürün başarıyla eklendi. ${errorCount} ürün eklenemedi.`
    );
    setImportFile(null);
    fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-black font-semibold">
            Sayfa başı:
          </label>
          <select
            value={productsPerPage}
            onChange={(e) => {
              setProductsPerPage(Number(e.target.value));
              setPage(0);
            }}
            className="border px-2 py-1 text-sm bg-white text-black"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            <span>Şablon İndir</span>
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="h-5 w-5" />
              <span>Dosya Seç</span>
            </label>
          </div>
          <button
            onClick={() => setAddProductModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Ürün</span>
          </button>
        </div>
      </div>

      {importFile && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{importFile.length} ürün bulundu</p>
              <p className="text-sm text-gray-600">
                İçe aktarmak için onaylayın
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                İçe Aktar
              </button>
              <button
                onClick={() => setImportFile(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">Hata:</p>
          <p className="whitespace-pre-line">{importError}</p>
        </div>
      )}

      {importSuccess && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
          {importSuccess}
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-20 col-span-2">
              Ürün bulunamadı
            </div>
          ) : (
            pagedProducts.map((product) => {
              const imgSrc =
                product.images && product.images[0]
                  ? typeof product.images[0] === "string"
                    ? product.images[0]
                    : product.images[0].url
                  : "https://via.placeholder.com/300x200?text=No+Image";
              return (
                <div
                  key={product._id}
                  className="flex items-center bg-white shadow-sm overflow-hidden p-3 hover:bg-gray-50 transition-all min-h-[90px] border-b border-gray-200"
                >
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-16 h-16 object-cover mr-4 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate text-black">
                      {product.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center mt-1">
                      <span className="text-black text-xs">
                        {product.price} ₺
                      </span>
                      <span className="text-xs text-gray-500">
                        Stok: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <button
                      onClick={() => openEditProductModal(product)}
                      className="px-3 py-1 bg-black text-white text-xs font-semibold border-0 rounded-none hover:bg-gray-900 transition"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product._id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-semibold border-0 rounded-none hover:bg-red-800 transition"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={`w-8 h-8 border text-sm font-medium ${
                  page === idx
                    ? "bg-black text-white border-black"
                    : "bg-white text-black hover:bg-gray-100 border-gray-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ürün Ekleme Modalı */}
      {addProductModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setAddProductModal(false)}
        >
          <div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative mx-2"
            style={{ maxHeight: "95vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setAddProductModal(false)}
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">Yeni Ürün Ekle</h2>
            {addProductError && (
              <div className="text-red-600 mb-2">{addProductError}</div>
            )}
            {addProductSuccess && (
              <div className="text-green-600 mb-2">{addProductSuccess}</div>
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
                <label className="block mb-1 text-sm">Renk</label>
                <input
                  type="text"
                  name="color"
                  value={addProductForm.color}
                  onChange={handleAddProductFormChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                  placeholder="Örn: Mavi"
                />
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

      {/* Ürün Düzenleme Modalı */}
      {editProductModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() =>
                setEditProductModal({ open: false, product: null })
              }
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">Ürünü Düzenle</h2>
            <form onSubmit={handleSaveEdit}>
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
                  <div className="mb-3">
                    <label className="block mb-1 text-sm">Renk</label>
                    <input
                      type="text"
                      name="color"
                      value={editProductForm.color || ""}
                      onChange={handleEditProductFormChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                      placeholder="Örn: Mavi"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-3">
                    <label className="block mb-1 text-sm">
                      Varyantlar (Beden, Stok)
                    </label>
                    {editProductForm.variants &&
                      editProductForm.variants.map((variant, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-center">
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
                          {idx === editProductForm.variants.length - 1 && (
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
    </div>
  );
}

export default Products;
