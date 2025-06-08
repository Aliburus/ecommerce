import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import moment from "moment";
import { getProducts } from "../../services/productService";

// Axios için base URL ve cookie ayarları
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    startDate: "",
    endDate: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    description: "",
    isCategoryDiscount: false,
    categoryId: "",
    autoApply: false,
  });
  const [categoryDiscountForm, setCategoryDiscountForm] = useState({
    categoryId: "",
    type: "percentage",
    value: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
      .toISOString()
      .slice(0, 10),
    isActive: true,
    isCategoryDiscount: true,
    autoApply: true,
  });
  const [productCategories, setProductCategories] = useState([]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/discounts");
      setDiscounts(data);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        window.location.href = "/login";
      } else {
        toast.error("İndirimler yüklenirken hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/categories");
      setCategories(data);
    } catch (error) {
      toast.error("Kategoriler yüklenirken hata oluştu");
    }
  };

  const fetchProductCategories = async () => {
    try {
      const products = await getProducts();
      // Ürünlerden kategorileri topla (tekrarsız)
      const cats = products
        .map((p) => p.category)
        .filter((c) => c && c._id && c.name);
      // Tekrarsız
      const uniqueCats = Array.from(
        new Map(cats.map((c) => [c._id, c])).values()
      );
      setProductCategories(uniqueCats);
    } catch (error) {
      toast.error("Ürün kategorileri alınamadı");
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchCategories();
    fetchProductCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const discountData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingId) {
        await axios.put(`/api/discounts/${editingId}`, discountData);
        toast.success("İndirim güncellendi");
      } else {
        await axios.post("/api/discounts", discountData);
        toast.success("İndirim başarıyla oluşturuldu");
      }

      setIsModalVisible(false);
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        startDate: "",
        endDate: "",
        minPurchaseAmount: "",
        maxDiscountAmount: "",
        usageLimit: "",
        description: "",
        isCategoryDiscount: false,
        categoryId: "",
        autoApply: false,
      });
      setEditingId(null);
      fetchDiscounts();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        window.location.href = "/login";
      } else {
        toast.error(
          error.response?.data?.message || "İndirim oluşturulurken hata oluştu"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("İndirimi silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`/api/discounts/${id}`);
      toast.success("İndirim başarıyla silindi");
      fetchDiscounts();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        window.location.href = "/login";
      } else {
        toast.error("İndirim silinirken hata oluştu");
      }
    }
  };

  const handleEdit = (discount) => {
    setEditingId(discount._id);
    setFormData({
      ...discount,
      startDate: moment(discount.startDate).format("YYYY-MM-DD"),
      endDate: moment(discount.endDate).format("YYYY-MM-DD"),
    });
    setIsModalVisible(true);
  };

  const handleCategoryDiscountChange = (e) => {
    const { name, value } = e.target;
    setCategoryDiscountForm((prev) => ({
      ...prev,
      [name]: value,
      isActive: true,
      isCategoryDiscount: true,
      autoApply: true,
    }));
  };

  const handleCategoryDiscountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...categoryDiscountForm,
        value: Number(categoryDiscountForm.value),
        minPurchaseAmount: categoryDiscountForm.minPurchaseAmount
          ? Number(categoryDiscountForm.minPurchaseAmount)
          : undefined,
        maxDiscountAmount: categoryDiscountForm.maxDiscountAmount
          ? Number(categoryDiscountForm.maxDiscountAmount)
          : undefined,
        usageLimit: categoryDiscountForm.usageLimit
          ? Number(categoryDiscountForm.usageLimit)
          : undefined,
        code: `KATEGORI_${categoryDiscountForm.categoryId}_${Date.now()}`,
        startDate: new Date(categoryDiscountForm.startDate).toISOString(),
        endDate: new Date(categoryDiscountForm.endDate).toISOString(),
        isActive: true,
        isCategoryDiscount: true,
        autoApply: true,
      };
      console.log("KATEGORİ İNDİRİMİ OLUŞTURULUYOR:", data);
      await axios.post("/api/discounts", data);
      toast.success("Kategori indirimi oluşturuldu");
      console.log("KATEGORİ İNDİRİMİ BAŞARILI:", data);
      setCategoryDiscountForm({
        categoryId: "",
        type: "percentage",
        value: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7))
          .toISOString()
          .slice(0, 10),
        isActive: true,
        isCategoryDiscount: true,
        autoApply: true,
      });
      fetchDiscounts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Kategori indirimi eklenemedi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">İndirim Yönetimi</h2>

      {/* Kategori İndirimi Ekleme Formu */}
      <form
        onSubmit={handleCategoryDiscountSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-6"
      >
        <h3 className="text-lg font-semibold mb-4">
          Kategoriye Özel İndirim Ekle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Kategori</label>
            <select
              name="categoryId"
              value={categoryDiscountForm.categoryId}
              onChange={handleCategoryDiscountChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Kategori Seçin</option>
              {productCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">İndirim Tipi</label>
            <select
              name="type"
              value={categoryDiscountForm.type}
              onChange={handleCategoryDiscountChange}
              className="w-full p-2 border rounded"
            >
              <option value="percentage">Yüzde</option>
              <option value="fixed">Sabit Tutar</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">İndirim Değeri</label>
            <input
              type="number"
              name="value"
              value={categoryDiscountForm.value}
              onChange={handleCategoryDiscountChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Başlangıç Tarihi</label>
            <input
              type="date"
              name="startDate"
              value={categoryDiscountForm.startDate}
              onChange={handleCategoryDiscountChange}
              className="w-full p-2 border rounded"
              required
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div>
            <label className="block mb-2">Bitiş Tarihi</label>
            <input
              type="date"
              name="endDate"
              value={categoryDiscountForm.endDate}
              onChange={handleCategoryDiscountChange}
              className="w-full p-2 border rounded"
              required
              min={categoryDiscountForm.startDate}
            />
          </div>
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="autoApply"
              checked={categoryDiscountForm.autoApply}
              onChange={handleCategoryDiscountChange}
              className="mr-2"
            />
            <label>Sepete Otomatik Uygula</label>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Kaydediliyor..." : "Kategori İndirimi Oluştur"}
        </button>
      </form>

      {/* İndirim Ekleme Formu */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">İndirim Kodu</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">İndirim Tipi</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="percentage">Yüzde</option>
              <option value="fixed">Sabit Tutar</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">İndirim Değeri</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Başlangıç Tarihi</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Bitiş Tarihi</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Minimum Alışveriş Tutarı</label>
            <input
              type="number"
              name="minPurchaseAmount"
              value={formData.minPurchaseAmount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Maksimum İndirim Tutarı</label>
            <input
              type="number"
              name="maxDiscountAmount"
              value={formData.maxDiscountAmount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Kullanım Limiti</label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Açıklama</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Kategori İndirimi Alanları */}
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isCategoryDiscount"
                checked={formData.isCategoryDiscount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isCategoryDiscount: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label htmlFor="isCategoryDiscount">Kategori İndirimi</label>
            </div>

            {formData.isCategoryDiscount && (
              <>
                <div className="mb-4">
                  <label className="block mb-2">Kategori</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required={formData.isCategoryDiscount}
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="autoApply"
                    checked={formData.autoApply}
                    onChange={(e) =>
                      setFormData({ ...formData, autoApply: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="autoApply">Sepete Otomatik Uygula</label>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Kaydediliyor..." : "İndirim Oluştur"}
        </button>
      </form>

      {/* İndirim Listesi */}
      <div className="bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left">Kod</th>
              <th className="p-4 text-left">Tip</th>
              <th className="p-4 text-left">Değer</th>
              <th className="p-4 text-left">Geçerlilik</th>
              <th className="p-4 text-left">Kategori</th>
              <th className="p-4 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount._id} className="border-t">
                <td className="p-4">{discount.code}</td>
                <td className="p-4">
                  {discount.type === "percentage" ? "Yüzde" : "Sabit"}
                </td>
                <td className="p-4">
                  {discount.type === "percentage"
                    ? `%${discount.value}`
                    : `${discount.value} TL`}
                </td>
                <td className="p-4">
                  {new Date(discount.startDate).toLocaleDateString()} -{" "}
                  {new Date(discount.endDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {discount.isCategoryDiscount
                    ? categories.find((c) => c._id === discount.categoryId)
                        ?.name || "-"
                    : "-"}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleEdit(discount)}
                    className="text-yellow-500 hover:text-yellow-700 mr-2"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(discount._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Discounts;
