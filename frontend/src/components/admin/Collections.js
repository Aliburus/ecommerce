import React, { useState } from "react";
import { Plus } from "lucide-react";

function Collections({
  collections,
  products,
  onAddCollection,
  onEditCollection,
  onDeleteCollection,
}) {
  const [addCollectionModal, setAddCollectionModal] = useState(false);
  const [editCollectionModal, setEditCollectionModal] = useState({
    open: false,
    collection: null,
  });
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    image: "",
    products: [],
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    image: "",
    products: [],
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const handleCollectionChange = (e) => {
    const { name, value } = e.target;
    setNewCollection({ ...newCollection, [name]: value });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleAddCollectionSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await onAddCollection({
        name: newCollection.name,
        description: newCollection.description,
        image: newCollection.image,
        products: selectedProducts,
      });
      setSuccess("Koleksiyon eklendi");
      setNewCollection({ name: "", description: "", image: "", products: [] });
      setSelectedProducts([]);
      setShowProductSelect(false);
      setAddCollectionModal(false);
    } catch (err) {
      setError("Koleksiyon eklenemedi");
    }
  };

  const handleEditCollectionSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    try {
      await onEditCollection(editCollectionModal.collection._id, editForm);
      setEditSuccess("Koleksiyon güncellendi");
      setEditCollectionModal({ open: false, collection: null });
    } catch {
      setEditError("Güncelleme başarısız");
    }
  };

  const openEditModal = (collection) => {
    setEditForm({
      name: collection.name,
      description: collection.description,
      image: collection.image,
      products: collection.products || [],
    });
    setEditCollectionModal({ open: true, collection });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Koleksiyonlar</h1>
        <div className="flex items-center space-x-4">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            onClick={() => setAddCollectionModal(true)}
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Koleksiyon</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <div
            key={collection._id}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            {collection.image && (
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold">{collection.name}</h3>
              <p className="text-gray-600 mb-2">{collection.description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(collection)}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => onDeleteCollection(collection._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Yeni Koleksiyon Modalı */}
      {addCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setAddCollectionModal(false)}
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">Yeni Koleksiyon Ekle</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">{success}</div>}
            <form onSubmit={handleAddCollectionSubmit}>
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
                    {products.map((product) => (
                      <div key={product._id} className="flex items-center mb-1">
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
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 w-full"
              >
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Düzenle Modalı */}
      {editCollectionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() =>
                setEditCollectionModal({ open: false, collection: null })
              }
            >
              X
            </button>
            <h2 className="text-lg font-bold mb-4">Koleksiyonu Düzenle</h2>
            {editError && <div className="text-red-600 mb-2">{editError}</div>}
            {editSuccess && (
              <div className="text-green-600 mb-2">{editSuccess}</div>
            )}
            <form onSubmit={handleEditCollectionSubmit}>
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
                    <div className="text-gray-500">Henüz ürün eklenmemiş</div>
                  )}
                </div>
                <div className="mt-2">
                  <select
                    onChange={(e) => handleAddProductToEdit(e.target.value)}
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
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 w-full"
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

export default Collections;
