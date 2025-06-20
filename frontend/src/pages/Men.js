import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import LoadingSpinner from "../components/LoadingSpinner";
import FilterBar from "../components/FilterBar";

function Men() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const initialCategory =
    new URLSearchParams(location.search).get("category") || "";

  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    sizes: [],
    colors: [],
    gender: "",
    category: initialCategory,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.gender) params.append("gender", filters.gender);
        params.append("page", page);

        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products?${params.toString()}`
        );
        setProducts(data.products || []);
        setPages(data.pages || 1);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/wishlist`,
          { withCredentials: true }
        );
        setWishlist(res.data.map((item) => item.product._id));
      } catch {}
    };
    fetchProducts();
    fetchWishlist();
  }, [filters.category, filters.gender, page]);

  const handleWishlist = async (id) => {
    try {
      const isWished = wishlist.includes(id);
      const url = isWished
        ? `${process.env.REACT_APP_API_URL}/api/user/wishlist/remove`
        : `${process.env.REACT_APP_API_URL}/api/user/wishlist/add`;
      await axios.post(url, { productId: id }, { withCredentials: true });
      setWishlist((prev) =>
        isWished ? prev.filter((pid) => pid !== id) : [...prev, id]
      );
    } catch (err) {}
  };

  const handleFilterChange = (type, value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-red-500">Hata: {error}</div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl">Ürün bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto mt-20 px-2 flex flex-row gap-8">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={() =>
            setFilters({
              priceRange: [0, 5000],
              sizes: [],
              colors: [],
              gender: "",
              category: initialCategory,
            })
          }
        />
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-10">
            {products.map((product) => (
              <div
                key={product._id}
                className="group cursor-pointer"
                onClick={() => navigate(`/urun/${product._id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-4 ">
                  <img
                    src={
                      product.images[0]?.url
                        ? `${process.env.REACT_APP_API_URL}${product.images[0].url}`
                        : "/placeholder.jpg"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(product._id);
                    }}
                  >
                    {wishlist.includes(product._id) ? (
                      <AiFillHeart className="h-6 w-6 text-red-600" />
                    ) : (
                      <AiOutlineHeart className="h-6 w-6 text-red-600" />
                    )}
                  </button>
                </div>
                <h3 className="text-m font-thin mb-1 text-center">
                  {product.name}
                </h3>
                <p className="text-black text-center text-lg  mb-2">
                  {product.price} ₺
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center mt-10 space-x-2">
              {[...Array(pages).keys()].map((p) => (
                <button
                  key={p + 1}
                  onClick={() => setPage(p + 1)}
                  className={`w-10 h-10 rounded-full border text-sm font-medium ${
                    page === p + 1
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Men;
