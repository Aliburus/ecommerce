import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBestSellingCategories = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/categories/best-sellers`
        );
        setCategories(data);
      } catch (err) {
        setError("Öne çıkan kategoriler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellingCategories();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  // Rastgele kategori görselleri (şimdilik)
  const categoryImages = [
    "https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Öne Çıkan Kategoriler
        </h2>
        <div className="grid grid-cols-10 grid-rows-2 gap-8 min-h-[400px]">
          {/* Üst sol: %70 */}
          {categories[0] && (
            <div
              key={categories[0]._id}
              className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer col-span-7 row-span-1 min-h-[200px]"
              onClick={() => navigate(`/men?category=${categories[0]._id}`)}
            >
              <img
                src={categoryImages[0]}
                alt={categories[0].name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <h3 className="text-white text-3xl font-bold drop-shadow-lg text-center">
                  {categories[0].name}
                </h3>
              </div>
            </div>
          )}
          {/* Üst sağ: %30 */}
          {categories[1] && (
            <div
              key={categories[1]._id}
              className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer col-span-3 row-span-1 min-h-[200px]"
              onClick={() => navigate(`/men?category=${categories[1]._id}`)}
            >
              <img
                src={categoryImages[1]}
                alt={categories[1].name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <h3 className="text-white text-xl font-bold drop-shadow-lg text-center">
                  {categories[1].name}
                </h3>
              </div>
            </div>
          )}
          {/* Alt sol: %30 */}
          {categories[2] && (
            <div
              key={categories[2]._id}
              className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer col-span-3 row-start-2 min-h-[200px]"
              onClick={() => navigate(`/men?category=${categories[2]._id}`)}
            >
              <img
                src={categoryImages[2]}
                alt={categories[2].name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <h3 className="text-white text-xl font-bold drop-shadow-lg text-center">
                  {categories[2].name}
                </h3>
              </div>
            </div>
          )}
          {/* Alt sağ: %70 */}
          {categories[3] && (
            <div
              key={categories[3]._id}
              className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer col-span-7 row-start-2 min-h-[200px]"
              onClick={() => navigate(`/men?category=${categories[3]._id}`)}
            >
              <img
                src={categoryImages[3]}
                alt={categories[3].name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <h3 className="text-white text-3xl font-bold drop-shadow-lg text-center">
                  {categories[3].name}
                </h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeaturedCategories;
