import React, { useEffect, useState } from "react";
import { getRecommendations } from "../services/recommendationService";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.error("Öneriler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev + 1 >= recommendations.length - 3 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev - 1 < 0 ? recommendations.length - 4 : prev - 1
    );
  };

  // Otomatik slider
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(timer);
  }, [recommendations.length]);

  if (loading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  if (recommendations.length <= 4) {
    return null;
  }

  const showSlider = recommendations.length > 4;
  const visibleProducts = showSlider
    ? recommendations.slice(currentSlide, currentSlide + 4)
    : recommendations;

  return (
    <div className="mt-8 relative">
      <h2 className="text-2xl font-semibold mb-4">Size Özel Öneriler</h2>
      <div className="relative">
        {/* Navigation buttons */}
        {showSlider && (
          <>
            <button
              onClick={prevSlide}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg transition-all border border-gray-200"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg transition-all border border-gray-200"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </>
        )}
        {/* Products grid */}
        <div className="grid grid-cols-4 gap-4">
          {visibleProducts.map((product) => (
            <Link
              key={product._id}
              to={`/urun/${product._id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                <div className="relative pb-[100%]">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${product.images[0]?.url}`}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {formatPrice(product.price)} TL
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Dots indicator */}
        {showSlider && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: recommendations.length - 3 }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? "bg-primary w-6" : "bg-gray-300"
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRecommendations;
